import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import { getDbPool } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { createSessionToken, sessionCookie } from "@/lib/session";

type SignupRequestBody = {
  email?: string;
  password?: string;
  displayName?: string;
};

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupRequestBody;

    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    const displayName = body.displayName?.trim() ?? "";
    const role: "USER" | "ADMIN" = "USER";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 },
      );
    }

    if (displayName.length < 2 || displayName.length > 64) {
      return NextResponse.json(
        { error: "Display name must be 2-64 characters." },
        { status: 400 },
      );
    }

    const passwordHash = hashPassword(password);
    const db = getDbPool();

    const [result] = await db.execute<ResultSetHeader>(
      "INSERT INTO `User` (`email`, `passwordHash`, `displayName`, `role`) VALUES (?, ?, ?, ?)",
      [email, passwordHash, displayName, role],
    );

    const userId = Number(result.insertId);
    const token = createSessionToken(userId, email, displayName, role);

    const cookieStore = await cookies();
    cookieStore.set(sessionCookie.name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionCookie.maxAge,
    });

    return NextResponse.json(
      {
        user: {
          id: userId,
          email,
          displayName,
          role,
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
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }

    return NextResponse.json({ error: "Unable to sign up." }, { status: 500 });
  }
}
