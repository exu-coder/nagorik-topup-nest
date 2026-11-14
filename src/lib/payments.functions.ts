import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, getRequestUrl } from "@tanstack/react-start/server";
import { z } from "zod";

import { getCategory, quote } from "./catalog";
import { createNagorikPayment, verifyNagorikPayment } from "./nagorikpay.server";

function siteOrigin() {
  const url = getRequestUrl();
  const host = getRequestHeader("x-forwarded-host") ?? url.host;
  const proto = getRequestHeader("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

const checkoutSchema = z.object({
  slug: z.string().min(1).max(40),
  selection: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("package"), packageId: z.string().min(1).max(40) }),
    z.object({ kind: z.literal("custom"), quantity: z.number().int().positive().max(1_000_000) }),
  ]),
  targetId: z
    .string()
    .trim()
    .regex(/^\d{5,15}$/, "ID must be 5–15 digits"),
  customerName: z.string().trim().min(2).max(60),
  customerEmail: z.string().trim().email().max(120),
  phone: z
    .string()
    .trim()
    .regex(/^01\d{9}$/, "Use an 11-digit number starting with 01")
    .optional()
    .or(z.literal("")),
});

export const startCheckout = createServerFn({ method: "POST" })
  .validator((data: unknown) => checkoutSchema.parse(data))
  .handler(async ({ data }) => {
    const category = getCategory(data.slug);
    if (!category) throw new Error("Unknown product");
    const { amount, label } = quote(data.slug, data.selection);
    const origin = siteOrigin();

    const paymentUrl = await createNagorikPayment({
      amount,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      successUrl: `${origin}/payment-return`,
      cancelUrl: `${origin}/category/${category.slug}?cancelled=1`,
      webhookUrl: `${origin}/api/public/nagorikpay`,
      metadata: {
        shop: "MFJ TOP UP",
        category: category.slug,
        item: label,
        target_id: data.targetId,
        phone: data.phone ?? "",
      },
    });
    return { paymentUrl };
  });

export const checkPayment = createServerFn({ method: "GET" })
  .validator((data: unknown) =>
    z.object({ transactionId: z.string().trim().min(4).max(64).regex(/^[A-Za-z0-9_-]+$/) }).parse(data),
  )
  .handler(async ({ data }) => {
    const p = await verifyNagorikPayment(data.transactionId);
    if (!p) return { found: false as const };
    const meta = p.metadata;
    return {
      found: true as const,
      transactionId: p.transactionId,
      status: p.status,
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      item: typeof meta["item"] === "string" ? meta["item"] : null,
      targetId: typeof meta["target_id"] === "string" ? meta["target_id"] : null,
    };
  });
