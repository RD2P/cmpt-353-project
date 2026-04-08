import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getDbPool } from "@/lib/db";
type AttachmentRow = RowDataPacket & {
  id: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
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
      return NextResponse.json({ error: "Valid postId is required." }, { status: 400 });
    }

    const db = getDbPool();
    const [attachments] = await db.execute<AttachmentRow[]>(
      "SELECT `id`, `filename`, `mimeType`, `sizeBytes` FROM `Attachment` WHERE `targetType` = 'POST' AND `targetId` = ? ORDER BY `id` ASC",
      [postId],
    );

    return NextResponse.json({ attachments });
  } catch {
    return NextResponse.json({ error: "Unable to fetch attachments." }, { status: 500 });
  }
}
