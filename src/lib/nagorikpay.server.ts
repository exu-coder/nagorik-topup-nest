// Server-only NagorikPay client. Never import this from browser code.
const CREATE_URL = "https://secure-pay.nagorikpay.com/api/payment/create";
const VERIFY_URL = "https://api.nagorikpay.com/api/transaction/verify";

function apiKey() {
  const key = process.env["NAGORIKPAY_API_KEY"];
  if (!key) throw new Error("NAGORIKPAY_API_KEY is not configured");
  return key;
}

export interface CreatePaymentInput {
  amount: number;
  customerName: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  webhookUrl: string;
  metadata: Record<string, string | number>;
}

export async function createNagorikPayment(input: CreatePaymentInput): Promise<string> {
  const res = await fetch(CREATE_URL, {
    method: "POST",
    headers: { "API-KEY": apiKey(), "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      cus_name: input.customerName,
      cus_email: input.customerEmail,
      amount: String(input.amount),
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      webhook_url: input.webhookUrl,
      metadata: input.metadata,
    }),
  });
  const text = await res.text();
  let json: { status?: unknown; message?: string; payment_url?: string } = {};
  try {
    json = JSON.parse(text);
  } catch {
    console.error("NagorikPay create: non-JSON response", res.status, text.slice(0, 300));
    throw new Error("Payment gateway is not responding. Please try again.");
  }
  if (!json.payment_url) {
    console.error("NagorikPay create failed", res.status, json);
    throw new Error("Could not start the payment. Please try again.");
  }
  return json.payment_url;
}

export type GatewayStatus = "completed" | "pending" | "cancelled" | "failed" | "unknown";

export interface VerifiedPayment {
  transactionId: string;
  status: GatewayStatus;
  amount: number;
  paymentMethod: string | null;
  metadata: Record<string, unknown>;
}

export async function verifyNagorikPayment(transactionId: string): Promise<VerifiedPayment | null> {
  const res = await fetch(VERIFY_URL, {
    method: "POST",
    headers: { "API-KEY": apiKey(), "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ transaction_id: transactionId }),
  });
  if (res.status === 404) return null;
  const json = (await res.json().catch(() => null)) as {
    status?: string;
    data?: {
      transaction_id?: string;
      status?: string;
      amount?: number | string;
      payment_method?: string;
      metadata?: unknown;
    };
  } | null;
  if (!res.ok || !json?.data) {
    console.error("NagorikPay verify failed", res.status, json);
    throw new Error("Could not check the payment right now.");
  }
  const d = json.data;
  const raw = String(d.status ?? "").toLowerCase();
  const status: GatewayStatus = ["completed", "pending", "cancelled", "failed"].includes(raw)
    ? (raw as GatewayStatus)
    : "unknown";
  let metadata: Record<string, unknown> = {};
  if (d.metadata && typeof d.metadata === "object") metadata = d.metadata as Record<string, unknown>;
  else if (typeof d.metadata === "string") {
    try {
      metadata = JSON.parse(d.metadata);
    } catch {
      metadata = {};
    }
  }
  return {
    transactionId: d.transaction_id ?? transactionId,
    status,
    amount: Number(d.amount ?? 0),
    paymentMethod: d.payment_method ?? null,
    metadata,
  };
}
