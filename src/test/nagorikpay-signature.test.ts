import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { verifyNagorikPayWebhook } from "@/lib/nagorikpay-signature";

const secret = "test-secret";
const body = "paymentMethod=bkash&transactionId=NP123&paymentAmount=32&status=completed";
const ts = "1700000000";
const good = "sha256=" + createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");

describe("NagorikPay webhook signature", () => {
  it("accepts a correctly signed, fresh webhook", async () => {
    const r = await verifyNagorikPayWebhook({ secret, timestamp: ts, signature: good, rawBody: body, nowSeconds: 1700000010 });
    expect(r.ok).toBe(true);
  });
  it("rejects a tampered body", async () => {
    const r = await verifyNagorikPayWebhook({ secret, timestamp: ts, signature: good, rawBody: body.replace("32", "3200"), nowSeconds: 1700000010 });
    expect(r.ok).toBe(false);
  });
  it("rejects webhooks older than 5 minutes", async () => {
    const r = await verifyNagorikPayWebhook({ secret, timestamp: ts, signature: good, rawBody: body, nowSeconds: 1700000301 });
    expect(r.ok).toBe(false);
  });
  it("rejects a missing signature", async () => {
    const r = await verifyNagorikPayWebhook({ secret, timestamp: ts, signature: null, rawBody: body, nowSeconds: 1700000010 });
    expect(r.ok).toBe(false);
  });
});
