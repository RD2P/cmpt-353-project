import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import path from "path";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getDbPool } from "@/lib/db";
import { readSessionToken, sessionCookie } from "@/lib/session";

type PostRow = RowDataPacket & {
  id: number;
  channelId: number;
  authorId: number;
  title: string;
  body: string;
  createdAt: string;
  authorDisplayName: string;
};

type CreatePostBody = {
  channelId?: number;
  title?: string;
  body?: string;
};

type CreatePostInput = {
  channelId: number;
  title: string;
  body: string;
  photo: File | null;
};

type DeletePostBody = {
  postId?: number;
};

function parsePositiveInt(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function isAllowedPhoto(file: File): boolean {
  const allowedMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
  const allowedExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);

  return allowedMimeTypes.has(file.type) && allowedExtensions.has(path.extname(file.name).toLowerCase());
}

async function parseCreatePostInput(request: Request): Promise<CreatePostInput | { error: string }> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const channelId = Number(formData.get("channelId"));
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    const photoEntry = formData.get("photo");
    const photo = photoEntry instanceof File && photoEntry.size > 0 ? photoEntry : null;

    if (!Number.isInteger(channelId) || channelId <= 0) {
      return { error: "Valid channelId is required." };
    }

    return { channelId, title, body, photo };
  }

  const body = (await request.json()) as CreatePostBody;
  const channelId = Number(body.channelId);

  if (!Number.isInteger(channelId) || channelId <= 0) {
    return { error: "Valid channelId is required." };
  }

  return {
    channelId,
    title: body.title?.trim() ?? "",
    body: body.body?.trim() ?? "",
    photo: null,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const channelId = parsePositiveInt(url.searchParams.get("channelId"));

    if (!channelId) {
      return NextResponse.json({ error: "channelId is required." }, { status: 400 });
    }

    const db = getDbPool();
    const [posts] = await db.execute<PostRow[]>(
      "SELECT p.`id`, p.`channelId`, p.`authorId`, p.`title`, p.`body`, p.`createdAt`, u.`displayName` AS `authorDisplayName` FROM `Post` p INNER JOIN `User` u ON u.`id` = p.`authorId` WHERE p.`channelId` = ? ORDER BY p.`createdAt` DESC",
      [channelId],
    );

    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ error: "Unable to fetch posts." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const input = await parseCreatePostInput(request);
    if ("error" in input) {
      return NextResponse.json({ error: input.error }, { status: 400 });
    }

    const { channelId, title, body: postBody, photo } = input;

    if (title.length < 2 || title.length > 255) {
      return NextResponse.json({ error: "Title must be 2-255 characters." }, { status: 400 });
    }

    if (postBody.length < 2) {
      return NextResponse.json({ error: "Post body is required." }, { status: 400 });
    }

    const db = getDbPool();

    if (photo && (!isAllowedPhoto(photo) || photo.size > 5 * 1024 * 1024)) {
      return NextResponse.json(
        { error: "Photo must be PNG, JPG/JPEG, or WebP and no larger than 5MB." },
        { status: 400 },
      );
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute<ResultSetHeader>(
        "INSERT INTO `Post` (`channelId`, `authorId`, `title`, `body`) VALUES (?, ?, ?, ?)",
        [channelId, session.userId, title, postBody],
      );

      const postId = Number(result.insertId);

      if (photo) {
        const buffer = Buffer.from(await photo.arrayBuffer());
        await connection.execute<ResultSetHeader>(
          "INSERT INTO `Attachment` (`targetType`, `targetId`, `filename`, `mimeType`, `sizeBytes`, `data`) VALUES ('POST', ?, ?, ?, ?, ?)",
          [postId, photo.name, photo.type, photo.size, buffer],
        );
      }

      await connection.commit();

      return NextResponse.json(
        {
          post: {
            id: postId,
            channelId,
            authorId: session.userId,
            title,
            body: postBody,
          },
        },
        { status: 201 },
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch {
    return NextResponse.json({ error: "Unable to create post." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as DeletePostBody;
    const postId = Number(body.postId);

    if (!Number.isInteger(postId) || postId <= 0) {
      return NextResponse.json({ error: "Valid postId is required." }, { status: 400 });
    }

    const db = getDbPool();
    const [posts] = await db.execute<PostRow[]>(
      "SELECT `id`, `authorId` FROM `Post` WHERE `id` = ?",
      [postId],
    );

    if (posts.length === 0) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const post = posts[0];
    const isAuthor = post.authorId === session.userId;
    const isAdmin = session.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM `Post` WHERE `id` = ?",
      [postId],
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete post." }, { status: 500 });
  }
}

type UpdatePostBody = {
  postId?: number;
  title?: string;
  body?: string;
};

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as UpdatePostBody;
    const postId = Number(body.postId);
    const title = body.title?.trim() ?? "";
    const postBody = body.body?.trim() ?? "";

    if (!Number.isInteger(postId) || postId <= 0) {
      return NextResponse.json({ error: "Valid postId is required." }, { status: 400 });
    }

    if (title.length < 2 || title.length > 255) {
      return NextResponse.json({ error: "Title must be 2-255 characters." }, { status: 400 });
    }

    if (postBody.length < 2) {
      return NextResponse.json({ error: "Post body is required." }, { status: 400 });
    }

    const db = getDbPool();
    const [posts] = await db.execute<PostRow[]>(
      "SELECT `id`, `authorId` FROM `Post` WHERE `id` = ?",
      [postId],
    );

    if (posts.length === 0) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const post = posts[0];
    const isAuthor = post.authorId === session.userId;
    const isAdmin = session.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE `Post` SET `title` = ?, `body` = ? WHERE `id` = ?",
      [title, postBody, postId],
    );

    return NextResponse.json({
      post: {
        id: postId,
        title,
        body: postBody,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to update post." }, { status: 500 });
  }
}
