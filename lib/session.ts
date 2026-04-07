import { createHmac, randomBytes } from "node:crypto";

const SESSION_COOKIE_NAME = "qq_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: number;
  email: string;
  role: "USER" | "ADMIN";
  iat: number;
  nonce: string;
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return secret;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

export function createSessionToken(userId: number, email: string, role: "USER" | "ADMIN"): string {
  const payload: SessionPayload = {
    userId,
    email,
    role,
    iat: Date.now(),
    nonce: randomBytes(8).toString("hex"),
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export const sessionCookie = {
  name: SESSION_COOKIE_NAME,
  maxAge: SESSION_AGE_SECONDS,
};
