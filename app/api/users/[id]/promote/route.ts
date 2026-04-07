import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import { getDbPool } from "@/lib/db";
import { readSessionToken, sessionCookie } from "@/lib/session";

export async function POST(
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
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ error: "Invalid user id." }, { status: 400 });
    }

    const db = getDbPool();
    const [result] = await db.execute<ResultSetHeader>(
      "UPDATE `User` SET `role` = 'ADMIN' WHERE `id` = ?",
      [userId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to promote user." }, { status: 500 });
  }
}
