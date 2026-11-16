// Server-only helpers for the shop: live prices and order bookkeeping.
import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";
import { CATEGORIES, defaultPricing, type CategorySlug, type PricingMap } from "./catalog";
import type { VerifiedPayment } from "./nagorikpay.server";
import { nextOrderStatus, type OrderStatus } from "./order-sync";

/** Publishable-key client for public reads (active packages, category settings). */
function publicClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Database is not configured");
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Live prices for every category. Throws when the database can't be read. */
export async function loadPricing(): Promise<PricingMap> {
  const db = publicClient();
  const [pk, st] = await Promise.all([
    db.from("product_packages").select("id, category_slug, title, detail, price, sort_order").eq("active", true).order("sort_order"),
    db.from("category_settings").select("*"),
  ]);
  if (pk.error) throw pk.error;
  if (st.error) throw st.error;
  const map: PricingMap = {};
  for (const c of CATEGORIES) {
    const s = st.data.find((x) => x.slug === c.slug);
    const fallback = defaultPricing(c.slug);
    const hasCustom =
      s && s.custom_price_per_step != null && s.custom_step != null && s.custom_min != null && s.custom_max != null;
    map[c.slug as CategorySlug] = {
      active: s ? s.active : true,
      packages: pk.data
        .filter((p) => p.category_slug === c.slug)
        .map((p) => ({ id: p.id, title: p.title, detail: p.detail, price: Number(p.price) })),
      custom: hasCustom
        ? {
            pricePerStep: Number(s.custom_price_per_step),
            step: s.custom_step!,
            min: s.custom_min!,
            max: s.custom_max!,
          }
        : s
          ? null
          : (fallback?.custom ?? null),
    };
  }
  return map;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export async function isCustomerBlocked(email: string) {
  const db = await admin();
  const { data } = await db.from("customers").select("blocked").eq("email", email).maybeSingle();
  return data?.blocked === true;
}

export async function createPendingOrder(input: {
  categorySlug: string;
  itemLabel: string;
  selection: unknown;
  targetId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  amount: number;
}) {
  const db = await admin();
  await db.from("customers").upsert(
    { email: input.customerEmail, name: input.customerName, ...(input.phone ? { phone: input.phone } : {}) },
    { onConflict: "email", ignoreDuplicates: false },
  );
  const { data, error } = await db
    .from("orders")
    .insert({
      category_slug: input.categorySlug,
      item_label: input.itemLabel,
      selection: input.selection as Database["public"]["Tables"]["orders"]["Insert"]["selection"],
      target_id: input.targetId,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      phone: input.phone,
      amount: input.amount,
    })
    .select("id")
    .single();
  if (error) {
    console.error("Could not save order", error);
    throw new Error("Could not save your order. Please try again.");
  }
  return data.id;
}

/** Apply a payment that was verified with NagorikPay to its order. Safe to call repeatedly. */
export async function syncOrderWithPayment(payment: VerifiedPayment) {
  const orderId = payment.metadata["order_id"];
  if (typeof orderId !== "string" || !/^[0-9a-f-]{36}$/i.test(orderId)) return;
  const db = await admin();
  const { data: order } = await db.from("orders").select("id, status, amount").eq("id", orderId).maybeSingle();
  if (!order) return;
  const next = nextOrderStatus(
    { status: order.status as OrderStatus, amount: Number(order.amount) },
    { status: payment.status, amount: payment.amount },
  );
  if (!next) {
    if (payment.status === "completed" && payment.amount < Number(order.amount)) {
      console.error("Payment amount below order total", { orderId, paid: payment.amount, due: order.amount });
    }
    return;
  }
  const { error } = await db
    .from("orders")
    .update({
      status: next,
      transaction_id: payment.transactionId,
      payment_method: payment.paymentMethod,
      ...(next === "paid" ? { paid_at: new Date().toISOString() } : {}),
    })
    .eq("id", orderId)
    .eq("status", order.status);
  if (error) console.error("Could not update order", orderId, error);
}
