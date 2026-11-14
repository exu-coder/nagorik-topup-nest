import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, Home, XCircle } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { formatTaka } from "@/lib/catalog";
import { checkPayment } from "@/lib/payments.functions";

const searchSchema = z.object({
  transactionId: z.string().optional(),
  transaction_id: z.string().optional(),
});

const paymentQuery = (transactionId: string) =>
  queryOptions({
    queryKey: ["payment", transactionId],
    queryFn: () => checkPayment({ data: { transactionId } }),
    staleTime: 0,
  });

export const Route = createFileRoute("/payment-return")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ id: search.transactionId ?? search.transaction_id ?? "" }),
  loader: async ({ context, deps }) => {
    if (!/^[A-Za-z0-9_-]{4,64}$/.test(deps.id)) return;
    await context.queryClient.ensureQueryData(paymentQuery(deps.id));
  },
  head: () => ({
    meta: [
      { title: "Payment status — MFJ TOP UP" },
      { name: "description", content: "Check the status of your MFJ TOP UP payment." },
      { property: "og:title", content: "Payment status — MFJ TOP UP" },
      { property: "og:description", content: "Check the status of your MFJ TOP UP payment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  errorComponent: () => (
    <Shell icon={<XCircle className="h-14 w-14 text-destructive" />} title="Couldn't check payment">
      <p className="text-muted-foreground">একটু পরে আবার চেষ্টা করুন। টাকা কেটে থাকলে আপনার অর্ডার নিরাপদ আছে।</p>
    </Shell>
  ),
  component: PaymentReturn,
});

function PaymentReturn() {
  const search = Route.useSearch();
  const id = search.transactionId ?? search.transaction_id ?? "";
  if (!/^[A-Za-z0-9_-]{4,64}$/.test(id)) {
    return (
      <Shell icon={<XCircle className="h-14 w-14 text-destructive" />} title="No payment found">
        <p className="text-muted-foreground">এই লিংকে কোনো পেমেন্ট আইডি নেই।</p>
      </Shell>
    );
  }
  return <PaymentDetails id={id} />;
}

function PaymentDetails({ id }: { id: string }) {
  const { data } = useSuspenseQuery(paymentQuery(id));
  if (!data.found) {
    return (
      <Shell icon={<XCircle className="h-14 w-14 text-destructive" />} title="Payment not found">
        <p className="text-muted-foreground">Transaction {id} খুঁজে পাওয়া যায়নি।</p>
      </Shell>
    );
  }
  const done = data.status === "completed";
  const pending = data.status === "pending";
  return (
    <Shell
      icon={
        done ? (
          <CheckCircle2 className="h-14 w-14 text-success" />
        ) : pending ? (
          <Clock className="h-14 w-14 text-gold" />
        ) : (
          <XCircle className="h-14 w-14 text-destructive" />
        )
      }
      title={done ? "Payment successful" : pending ? "Payment pending" : "Payment not completed"}
    >
      <p className="text-muted-foreground">
        {done
          ? "ধন্যবাদ! আপনার অর্ডার ডেলিভারি লাইনে চলে গেছে।"
          : pending
            ? "পেমেন্ট যাচাই হচ্ছে — কিছুক্ষণ পর পেজটি রিফ্রেশ করুন।"
            : "পেমেন্ট সম্পন্ন হয়নি। আবার চেষ্টা করুন।"}
      </p>
      <dl className="mt-5 w-full divide-y divide-border rounded-xl border border-border bg-secondary text-left text-sm">
        <Row k="Item" v={data.item ?? "—"} />
        <Row k="UID / ID" v={data.targetId ?? "—"} />
        <Row k="Amount" v={formatTaka(data.amount)} />
        <Row k="Method" v={data.paymentMethod ?? "—"} />
        <Row k="Transaction" v={data.transactionId} />
      </dl>
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-2.5">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="break-all text-right font-medium">{v}</dd>
    </div>
  );
}

function Shell({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 pt-10 text-center">
      <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex justify-center">{icon}</div>
        <h1 className="mt-3 text-2xl font-bold">{title}</h1>
        <div className="mt-2 flex flex-col items-center">{children}</div>
        <Button asChild variant="gold" size="xl" className="mt-6 w-full">
          <Link to="/">
            <Home /> Back to shop
          </Link>
        </Button>
      </div>
    </div>
  );
}
