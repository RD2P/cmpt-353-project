import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getDbPool } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSessionToken, sessionCookie } from "@/lib/session";

type LoginRequestBody = {
  email?: string;
  password?: string;
};

type UserRow = RowDataPacket & {
  id: number;
  email: string;
  displayName: string;
  passwordHash: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginRequestBody;
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const db = getDbPool();
    const [rows] = await db.execute<UserRow[]>(
      "SELECT `id`, `email`, `displayName`, `passwordHash` FROM `User` WHERE `email` = ? LIMIT 1",
      [email],
    );

    if (rows.length === 0 || !verifyPassword(password, rows[0].passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user = rows[0];
  const token = createSessionToken(user.id, user.email);

    const cookieStore = await cookies();
    cookieStore.set(sessionCookie.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionCookie.maxAge,
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to log in." }, { status: 500 });
  }
}
