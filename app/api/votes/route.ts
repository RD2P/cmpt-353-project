import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getDbPool } from "@/lib/db";
import { readSessionToken, sessionCookie } from "@/lib/session";

type VoteBody = {
  targetType?: "POST" | "REPLY";
  targetId?: number;
  value?: 1 | -1;
};

type ExistingVoteRow = RowDataPacket & {
  id: number;
  value: number;
};

type ScoreRow = RowDataPacket & {
  score: number;
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as VoteBody;
    const targetType = body.targetType;
    const targetId = Number(body.targetId);
    const value = Number(body.value);

    if (targetType !== "POST" && targetType !== "REPLY") {
      return NextResponse.json({ error: "Invalid targetType." }, { status: 400 });
    }

    if (!Number.isInteger(targetId) || targetId <= 0) {
      return NextResponse.json({ error: "Invalid targetId." }, { status: 400 });
    }

    if (value !== 1 && value !== -1) {
      return NextResponse.json({ error: "Value must be 1 or -1." }, { status: 400 });
    }

    const db = getDbPool();

    if (targetType === "POST") {
      const [postRows] = await db.execute<RowDataPacket[]>(
        "SELECT `id` FROM `Post` WHERE `id` = ? LIMIT 1",
        [targetId],
      );
      if (postRows.length === 0) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }
    } else {
      const [replyRows] = await db.execute<RowDataPacket[]>(
        "SELECT `id` FROM `Reply` WHERE `id` = ? LIMIT 1",
        [targetId],
      );
      if (replyRows.length === 0) {
        return NextResponse.json({ error: "Reply not found." }, { status: 404 });
      }
    }

    const [existingRows] = await db.execute<ExistingVoteRow[]>(
      "SELECT `id`, `value` FROM `Vote` WHERE `userId` = ? AND `targetType` = ? AND `targetId` = ? LIMIT 1",
      [session.userId, targetType, targetId],
    );

    let userVote: number | null = value;

    if (existingRows.length === 0) {
      await db.execute<ResultSetHeader>(
        "INSERT INTO `Vote` (`userId`, `targetType`, `targetId`, `value`) VALUES (?, ?, ?, ?)",
        [session.userId, targetType, targetId, value],
      );
    } else if (existingRows[0].value === value) {
      await db.execute<ResultSetHeader>(
        "DELETE FROM `Vote` WHERE `id` = ?",
        [existingRows[0].id],
      );
      userVote = null;
    } else {
      await db.execute<ResultSetHeader>(
        "UPDATE `Vote` SET `value` = ? WHERE `id` = ?",
        [value, existingRows[0].id],
      );
    }

    const [scoreRows] = await db.execute<ScoreRow[]>(
      "SELECT COALESCE(SUM(`value`), 0) AS `score` FROM `Vote` WHERE `targetType` = ? AND `targetId` = ?",
      [targetType, targetId],
    );

    return NextResponse.json({
      vote: {
        targetType,
        targetId,
        userVote,
        score: Number(scoreRows[0]?.score ?? 0),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to vote." }, { status: 500 });
  }
}
