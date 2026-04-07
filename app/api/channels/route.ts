import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getDbPool } from "@/lib/db";
import { readSessionToken, sessionCookie } from "@/lib/session";

type ChannelRow = RowDataPacket & {
  id: number;
  name: string;
  description: string | null;
  createdBy: number;
  createdAt: string;
  creatorDisplayName: string;
};

type CreateChannelBody = {
  name?: string;
  description?: string;
};

export async function GET() {
  try {
    const db = getDbPool();
    const [rows] = await db.execute<ChannelRow[]>(
      "SELECT c.`id`, c.`name`, c.`description`, c.`createdBy`, c.`createdAt`, u.`displayName` AS `creatorDisplayName` FROM `Channel` c INNER JOIN `User` u ON u.`id` = c.`createdBy` ORDER BY c.`createdAt` DESC",
    );

    return NextResponse.json({ channels: rows });
  } catch {
    return NextResponse.json({ error: "Unable to fetch channels." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as CreateChannelBody;
    const name = body.name?.trim() ?? "";
    const description = body.description?.trim() ?? "";

    if (name.length < 2 || name.length > 64) {
      return NextResponse.json({ error: "Channel name must be 2-64 characters." }, { status: 400 });
    }

    if (description.length > 2000) {
      return NextResponse.json({ error: "Description must be 2000 characters or fewer." }, { status: 400 });
    }

    const db = getDbPool();
    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO `Channel` (`name`, `description`, `createdBy`) VALUES (?, ?, ?)",
      [name, description.length > 0 ? description : null, session.userId],
    );

    return NextResponse.json(
      {
        channel: {
          id: Number(result.insertId),
          name,
          description: description.length > 0 ? description : null,
          createdBy: session.userId,
          creatorDisplayName: session.displayName,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "ER_DUP_ENTRY"
    ) {
      return NextResponse.json({ error: "Channel name is already taken." }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to create channel." }, { status: 500 });
  }
}
