/**
 * NagorikPay webhook signature check.
 * signature = HMAC_SHA256(key = webhook secret, message = timestamp + "." + rawBody)
 * header    = "sha256=" + hex(signature)
 * Uses Web Crypto so it runs on the server runtime without Node-only modules.
 */
export const MAX_WEBHOOK_AGE_SECONDS = 300;

async function hmacHex(secret: string, message: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function signNagorikPayWebhook(secret: string, timestamp: string, rawBody: string) {
  return `sha256=${await hmacHex(secret, `${timestamp}.${rawBody}`)}`;
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyNagorikPayWebhook(opts: {
  secret: string;
  timestamp: string | null;
  signature: string | null;
  rawBody: string;
  nowSeconds?: number;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  const { secret, timestamp, signature, rawBody } = opts;
  const now = opts.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (!timestamp || !/^\d+$/.test(timestamp)) return { ok: false, reason: "missing timestamp" };
  if (Math.abs(now - Number(timestamp)) > MAX_WEBHOOK_AGE_SECONDS) {
    return { ok: false, reason: "stale webhook" };
  }
  if (!signature) return { ok: false, reason: "missing signature" };
  const expected = await signNagorikPayWebhook(secret, timestamp, rawBody);
  return constantTimeEqual(expected, signature.trim())
    ? { ok: true }
    : { ok: false, reason: "invalid signature" };
}
