export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "delivered"
  | "failed"
  | "cancelled"
  | "refunded";

export type GatewayResult = "completed" | "pending" | "cancelled" | "failed" | "unknown";

/**
 * What a verified gateway result does to an order. An order only becomes "paid"
 * when the gateway says completed AND the amount covers the order total; work the
 * admin already started (processing, delivered, refunded) is never overwritten.
 */
export function nextOrderStatus(
  order: { status: OrderStatus; amount: number },
  payment: { status: GatewayResult; amount: number },
): OrderStatus | null {
  const open = order.status === "pending" || order.status === "failed" || order.status === "cancelled";
  if (!open) return null;
  if (payment.status === "completed") {
    return payment.amount + 0.001 >= order.amount ? "paid" : null;
  }
  if (order.status === "pending" && (payment.status === "failed" || payment.status === "cancelled")) {
    return payment.status;
  }
  return null;
}
