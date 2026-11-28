import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export const subscriberCookie = "maheshlabs_reader";
type Token = {
  purpose: "access" | "reader" | "unsubscribe";
  subscriber: string;
  episode?: number;
  expires?: number;
};

export function tokenSecret() {
  const secret = process.env.NEWSLETTER_TOKEN_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("NEWSLETTER_TOKEN_SECRET must contain at least 32 characters.");
  return secret;
}

export function signNewsletterToken(data: Token) {
  const payload = Buffer.from(JSON.stringify(data)).toString("base64url");
  const signature = createHmac("sha256", tokenSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function readNewsletterToken(value: string, purpose: Token["purpose"], now = Date.now()): Token | null {
  if (!value || value.length > 1000) return null;
  try {
    const [payload, signature, extra] = value.split(".");
    if (!payload || !signature || extra) return null;
    const expected = createHmac("sha256", tokenSecret()).update(payload).digest();
    const received = Buffer.from(signature, "base64url");
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Token;
    if (data.purpose !== purpose || !/^[a-f0-9-]{36}$/i.test(data.subscriber)) return null;
    if (purpose !== "unsubscribe" && (!Number.isSafeInteger(data.expires) || data.expires! <= now)) return null;
    if ((purpose === "access" || purpose === "reader") && (!Number.isSafeInteger(data.episode) || data.episode! <= 0)) return null;
    return data;
  } catch {
    return null;
  }
}
