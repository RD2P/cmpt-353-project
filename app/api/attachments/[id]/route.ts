import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getDbPool } from "@/lib/db";

type AttachmentRow = RowDataPacket & {
  id: number;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  data: Buffer;
};

function parsePositiveInt(value: string): number | null {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const attachmentId = parsePositiveInt(id);

    if (!attachmentId) {
      return NextResponse.json({ error: "Valid attachmentId is required." }, { status: 400 });
    }

    const db = getDbPool();
    const [rows] = await db.execute<AttachmentRow[]>(
      "SELECT `id`, `filename`, `mimeType`, `sizeBytes`, `data` FROM `Attachment` WHERE `id` = ? LIMIT 1",
      [attachmentId],
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
    }

    const attachment = rows[0];

    return new NextResponse(attachment.data, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(attachment.sizeBytes),
        "Content-Disposition": `inline; filename="${attachment.filename.replaceAll("\"", "")}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to fetch attachment." }, { status: 500 });
  }
}