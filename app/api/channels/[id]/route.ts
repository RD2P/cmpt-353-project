import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import { getDbPool } from "@/lib/db";
import { readSessionToken, sessionCookie } from "@/lib/session";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const cookieStore = await cookies();
    const session = readSessionToken(cookieStore.get(sessionCookie.name)?.value);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    const { id } = await context.params;
    const channelId = Number(id);

    if (!Number.isInteger(channelId) || channelId <= 0) {
      return NextResponse.json({ error: "Invalid channel id." }, { status: 400 });
    }

    const db = getDbPool();
    const [result] = await db.execute<ResultSetHeader>(
      "DELETE FROM `Channel` WHERE `id` = ?",
      [channelId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Channel not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete channel." }, { status: 500 });
  }
}
