import { createFileRoute } from "@tanstack/react-router";

import { verifyNagorikPayWebhook } from "@/lib/nagorikpay-signature";

// NagorikPay calls this after a payment. It is public, so the signature check
// below is what proves the request really came from NagorikPay.
export const Route = createFileRoute("/api/public/nagorikpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["NAGORIKPAY_WEBHOOK_SECRET"] || process.env["NAGORIKPAY_API_KEY"];
        if (!secret) return new Response("Not configured", { status: 503 });

        const rawBody = await request.text();
        const check = await verifyNagorikPayWebhook({
          secret,
          timestamp: request.headers.get("x-nagorikpay-timestamp"),
          signature: request.headers.get("x-nagorikpay-signature"),
          rawBody,
        });
        if (!check.ok) return new Response(check.reason, { status: 401 });

        const params = new URLSearchParams(rawBody);
        const transactionId = params.get("transactionId") ?? "";
        if (!/^[A-Za-z0-9_-]{4,64}$/.test(transactionId)) {
          return new Response("Bad payload", { status: 400 });
        }

        // Confirm with NagorikPay before trusting the status.
        const { verifyNagorikPayment } = await import("@/lib/nagorikpay.server");
        const payment = await verifyNagorikPayment(transactionId).catch((e) => {
          console.error("Webhook verify failed", e);
          return null;
        });
        console.log("NagorikPay webhook", {
          transactionId,
          status: payment?.status ?? params.get("status"),
          amount: payment?.amount,
        });
        // Orders and wallet credits are saved here once the database is connected.
        return new Response("ok", { status: 200 });
      },
    },
  },
});
