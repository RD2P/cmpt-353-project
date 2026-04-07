import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE_NAME = "qq_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  userId: number;
  email: string;
  displayName: string;
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

export function createSessionToken(userId: number, email: string, displayName: string): string {
  const payload: SessionPayload = {
    userId,
    email,
    displayName,
    iat: Date.now(),
    nonce: randomBytes(8).toString("hex"),
  };

  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(payloadEncoded);
  return `${payloadEncoded}.${signature}`;
}

export function readSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadEncoded, signature] = parts;
  const expectedSignature = sign(payloadEncoded);
  const provided = Buffer.from(signature, "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payloadText = Buffer.from(payloadEncoded, "base64url").toString("utf8");
    const parsed = JSON.parse(payloadText) as SessionPayload;

    if (
      typeof parsed.userId !== "number" ||
      typeof parsed.email !== "string" ||
      typeof parsed.displayName !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export const sessionCookie = {
  name: SESSION_COOKIE_NAME,
  maxAge: SESSION_AGE_SECONDS,
};
