import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getDbPool } from "@/lib/db";
import { readSessionToken, sessionCookie } from "@/lib/session";

type ReplyRow = RowDataPacket & {
  id: number;
  postId: number;
  parentReplyId: number | null;
  authorId: number;
  body: string;
  createdAt: string;
  authorDisplayName: string;
};

type CreateReplyBody = {
  postId?: number;
  body?: string;
  parentReplyId?: number | null;
};

type DeleteReplyBody = {
  replyId?: number;
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const postId = parsePositiveInt(url.searchParams.get("postId"));

    if (!postId) {
      return NextResponse.json({ error: "postId is required." }, { status: 400 });
    }

    const db = getDbPool();
    const [replies] = await db.execute<ReplyRow[]>(
      "SELECT r.`id`, r.`postId`, r.`parentReplyId`, r.`authorId`, r.`body`, r.`createdAt`, u.`displayName` AS `authorDisplayName` FROM `Reply` r INNER JOIN `User` u ON u.`id` = r.`authorId` WHERE r.`postId` = ? ORDER BY r.`createdAt` ASC",
      [postId],
    );

    return NextResponse.json({ replies });
  } catch {
    return NextResponse.json({ error: "Unable to fetch replies." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as CreateReplyBody;
    const postId = Number(body.postId);
    const replyBody = body.body?.trim() ?? "";
    const parentReplyId = body.parentReplyId ? Number(body.parentReplyId) : null;

    if (!Number.isInteger(postId) || postId <= 0) {
      return NextResponse.json({ error: "Valid postId is required." }, { status: 400 });
    }

    if (replyBody.length < 1) {
      return NextResponse.json({ error: "Reply body is required." }, { status: 400 });
    }

    const db = getDbPool();

    // Verify post exists
    const [posts] = await db.execute<RowDataPacket[]>(
      "SELECT `id` FROM `Post` WHERE `id` = ?",
      [postId],
    );

    if (posts.length === 0) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    // If parentReplyId is provided, verify it exists and belongs to the same post
    if (parentReplyId) {
      const [parentReplies] = await db.execute<RowDataPacket[]>(
        "SELECT `id`, `postId` FROM `Reply` WHERE `id` = ?",
        [parentReplyId],
      );

      if (parentReplies.length === 0) {
        return NextResponse.json({ error: "Parent reply not found." }, { status: 404 });
      }

      if (parentReplies[0].postId !== postId) {
        return NextResponse.json(
          { error: "Parent reply does not belong to this post." },
          { status: 400 },
        );
      }
    }

    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO `Reply` (`postId`, `parentReplyId`, `authorId`, `body`) VALUES (?, ?, ?, ?)",
      [postId, parentReplyId, session.userId, replyBody],
    );

    return NextResponse.json(
      {
        reply: {
          id: Number(result.insertId),
          postId,
          parentReplyId,
          authorId: session.userId,
          body: replyBody,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "Unable to create reply." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as DeleteReplyBody;
    const replyId = Number(body.replyId);

    if (!Number.isInteger(replyId) || replyId <= 0) {
      return NextResponse.json({ error: "Valid replyId is required." }, { status: 400 });
    }

    const db = getDbPool();
    const [replies] = await db.execute<RowDataPacket[]>(
      "SELECT `id`, `authorId` FROM `Reply` WHERE `id` = ?",
      [replyId],
    );

    if (replies.length === 0) {
      return NextResponse.json({ error: "Reply not found." }, { status: 404 });
    }

    const reply = replies[0];
    const isAuthor = reply.authorId === session.userId;
    const isAdmin = session.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    await db.execute<ResultSetHeader>("DELETE FROM `Reply` WHERE `id` = ?", [replyId]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete reply." }, { status: 500 });
  }
}
