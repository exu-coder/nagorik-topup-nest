import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowUpRight,
  Calculator,
  CalendarDays,
  Check,
  Loader2,
  Lock,
  Package,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PayLogos } from "@/components/site/pay-logos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatTaka, getCategory, quote, type Selection } from "@/lib/catalog";
import { startCheckout } from "@/lib/payments.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/category/$slug")({
  validateSearch: z.object({ cancelled: z.coerce.number().optional() }),
  loader: ({ params }) => {
    const category = getCategory(params.slug);
    if (!category) throw notFound();
    return { slug: category.slug, name: category.name, description: category.description };
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — MFJ TOP UP` : "MFJ TOP UP";
    const description = loaderData?.description ?? "MFJ TOP UP";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product.group" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { slug } = Route.useLoaderData();
  // Key by slug so picks from one product page never leak into another.
  return <CategoryView key={slug} slug={slug} />;
}

function CategoryView({ slug }: { slug: string }) {
  const { cancelled } = Route.useSearch();
  const category = getCategory(slug)!;
  const checkout = useServerFn(startCheckout);

  const [selection, setSelection] = useState<Selection>({
    kind: "package",
    packageId: category.packages[0]?.id ?? "",
  });
  const [customQty, setCustomQty] = useState(category.custom?.min ?? 0);
  const [targetId, setTargetId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cancelled) toast.info("Payment cancelled. You can try again anytime.");
  }, [cancelled]);

  const current = safeQuote(slug, selection, category.packages[0]?.id ?? "");
  const idValid = /^\d{5,15}$/.test(targetId.trim());
  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const phoneValid = phone.trim() === "" || /^01\d{9}$/.test(phone.trim());
  const canPay = idValid && name.trim().length >= 2 && emailValid && phoneValid && !loading;

  function pickCustom(q: number) {
    setCustomQty(q);
    setSelection({ kind: "custom", quantity: q });
  }

  async function pay() {
    setLoading(true);
    try {
      const { paymentUrl } = await checkout({
        data: {
          slug,
          selection,
          targetId: targetId.trim(),
          customerName: name.trim(),
          customerEmail: email.trim(),
          phone: phone.trim(),
        },
      });
      window.location.href = paymentUrl;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start the payment");
      setLoading(false);
    }
  }

  const pkgCount = String(category.packages.length).padStart(2, "0");

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4">
      <nav className="flex animate-rise items-center gap-2 text-sm">
        <Link
          to="/"
          className="surface inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-transform hover:-translate-x-0.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="truncate font-medium text-muted-foreground">{category.name}</span>
      </nav>

      {/* Intro */}
      <section className="mt-6 flex items-center gap-4">
        <div className="min-w-0 flex-1 animate-rise" style={{ "--d": "80ms" } as React.CSSProperties}>
          <p className="flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.18em] text-violet">
            <span className="h-1.5 w-1.5 animate-ping-soft rounded-full bg-success" /> MFJ Collection
          </p>
          <h1 className="mt-1.5 text-[30px] font-bold leading-[1.1] sm:text-4xl">{category.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> {category.packages.length} packages
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" /> Secure checkout
            </span>
          </div>
        </div>
        <div
          className="relative w-32 shrink-0 animate-float sm:w-44"
          style={{ "--tilt": "4deg" } as React.CSSProperties}
        >
          <div className="absolute inset-0 -translate-x-2 translate-y-2 -rotate-6 rounded-2xl border border-border bg-card shadow-soft" />
          <div className="shimmer relative overflow-hidden rounded-2xl border-4 border-card shadow-lift">
            <img
              src={category.image}
              alt={category.name}
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <span className="surface absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-lg text-primary">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </section>

      <div className="mt-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Packages */}
      <section className="mt-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-xs font-semibold text-violet">01 / THE COLLECTION</p>
            <h2 className="text-xl font-bold">Choose your package</h2>
          </div>
          <span className="font-display text-5xl font-bold leading-none text-muted-foreground/25">
            {pkgCount}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {category.packages.map((p, i) => {
            const active = selection.kind === "package" && selection.packageId === p.id;
            const Icon = /instant|ইনস্ট্যান্ট/i.test(p.detail) ? Zap : CalendarDays;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelection({ kind: "package", packageId: p.id })}
                aria-pressed={active}
                style={{ "--d": `${120 + i * 70}ms` } as React.CSSProperties}
                className={cn(
                  "group relative flex animate-rise flex-col rounded-2xl border bg-card p-4 text-left transition-all duration-300 active:scale-[0.98]",
                  active
                    ? "-translate-y-1 border-violet shadow-violet"
                    : "border-border shadow-soft hover:-translate-y-0.5 hover:shadow-lift",
                )}
              >
                <div className="flex items-start justify-between">
                  <Icon className={cn("h-4 w-4", active ? "text-violet" : "text-muted-foreground")} />
                  <span
                    className={cn(
                      "grid h-5 w-5 place-items-center rounded-full border-2 transition-colors",
                      active ? "border-violet bg-violet text-violet-foreground" : "border-border",
                    )}
                  >
                    {active && <Check className="h-3 w-3 animate-pop" />}
                  </span>
                </div>
                <p className="mt-3 text-center font-display text-lg font-bold">{p.title}</p>
                <p className="text-center text-sm font-semibold text-violet">{p.detail}</p>
                <div className="mt-4 flex items-end justify-between">
                  <p className="font-display text-xl font-bold">{formatTaka(p.price)}</p>
                  <span
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-full transition-all duration-300",
                      active
                        ? "rotate-45 bg-violet text-violet-foreground"
                        : "bg-violet/10 text-violet group-hover:rotate-45",
                    )}
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {category.custom && (
          <div
            className={cn(
              "reveal mt-3 rounded-3xl border bg-card p-5 transition-all duration-300",
              selection.kind === "custom" ? "border-violet shadow-violet" : "border-border shadow-soft",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold uppercase">Custom {category.custom.unitLabel}</p>
              <Calculator className="h-5 w-5 text-violet" />
            </div>
            <p className="mt-2 text-sm font-semibold capitalize">
              {category.custom.unitLabel}: {customQty.toLocaleString("en-US")}
            </p>
            <Slider
              className="mt-4"
              min={category.custom.min}
              max={category.custom.max}
              step={category.custom.step}
              value={[customQty]}
              onValueChange={([v]) => v !== undefined && pickCustom(v)}
              aria-label={`Custom ${category.custom.unitLabel}`}
            />
            <div className="mt-5 flex flex-wrap gap-2">
              {category.custom.presets.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => pickCustom(q)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95",
                    selection.kind === "custom" && customQty === q
                      ? "bg-gradient-violet text-violet-foreground shadow-violet"
                      : "bg-secondary hover:bg-accent",
                  )}
                >
                  {q.toLocaleString("en-US")}
                </button>
              ))}
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-dashed border-border pt-4">
              <div>
                <p className="font-display text-3xl font-bold">
                  {customQty.toLocaleString("en-US")}{" "}
                  <span className="text-sm font-medium text-muted-foreground">{category.custom.unitLabel}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTaka(category.custom.pricePerStep)} / {category.custom.step}{" "}
                  {category.custom.unitLabel}
                </p>
              </div>
              <div className="text-right">
                <p
                  key={customQty}
                  className="animate-pop font-display text-3xl font-bold text-gold"
                >
                  {formatTaka((customQty / category.custom.step) * category.custom.pricePerStep)}
                </p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Checkout */}
      <section className="reveal mt-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-semibold text-violet">02 / CHECKOUT</p>
            <h2 className="text-xl font-bold">Make it yours</h2>
          </div>
          <ShieldCheck className="h-6 w-6 text-violet" />
        </div>

        <div className="surface mt-4 space-y-4 rounded-3xl p-5">
          <p className="font-display font-bold">Player details</p>
          <Field label={category.targetLabel} htmlFor="target" error={targetId && !idValid ? "শুধু সংখ্যা, ৫–১৫ ডিজিট" : undefined}>
            <Input
              id="target"
              inputMode="numeric"
              placeholder={category.targetPlaceholder}
              value={targetId}
              onChange={(e) => setTargetId(e.target.value.replace(/\D/g, ""))}
              className="h-12 rounded-xl bg-background text-base"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" htmlFor="name">
              <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 rounded-xl bg-background text-base" />
            </Field>
            <Field label="Email (for receipt)" htmlFor="email" error={email && !emailValid ? "Valid email দিন" : undefined}>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl bg-background text-base" />
            </Field>
          </div>
          <Field label="WhatsApp number (optional)" htmlFor="phone" error={!phoneValid ? "01 দিয়ে শুরু ১১ ডিজিট" : undefined}>
            <Input id="phone" inputMode="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))} className="h-12 rounded-xl bg-background text-base" />
          </Field>
        </div>

        {/* Payment option */}
        <div className="surface mt-4 rounded-3xl p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-violet font-display font-bold text-violet-foreground">
              3
            </span>
            <p className="font-display text-lg font-bold">Payment method</p>
          </div>
          <div className="relative mt-4 overflow-hidden rounded-2xl border-2 border-violet bg-violet/5 p-4">
            <span className="absolute left-0 top-0 h-0 w-0 border-r-[34px] border-t-[34px] border-r-transparent border-t-violet" />
            <Check className="absolute left-1 top-1 h-3.5 w-3.5 text-violet-foreground" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-display font-bold">Instant Pay</p>
                <p className="text-xs text-muted-foreground">অটো কনফার্ম · NagorikPay</p>
              </div>
              <PayLogos size="sm" />
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between gap-3 rounded-2xl bg-secondary p-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">You pay</p>
              <p className="truncate text-sm font-semibold">{current.label}</p>
            </div>
            <p key={current.amount} className="animate-pop font-display text-2xl font-bold text-gold">
              {formatTaka(current.amount)}
            </p>
          </div>

          <Button variant="glossy" size="xl" className="mt-4 w-full text-base" disabled={!canPay} onClick={pay}>
            {loading ? <Loader2 className="animate-spin" /> : <Lock />}
            {loading ? "Opening payment…" : `Pay ${formatTaka(current.amount)}`}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            {canPay ? "নিরাপদ অটো পেমেন্ট — bKash · Nagad · Rocket" : `${category.targetLabel}, নাম ও ইমেইল দিন`}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="reveal mt-10">
        <h2 className="text-xl font-bold">সচরাচর জিজ্ঞাসা</h2>
        <Accordion type="single" collapsible className="surface mt-3 rounded-3xl px-5">
          {category.faqs.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`} className="last:border-b-0">
              <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}

function safeQuote(slug: string, selection: Selection, fallbackPackageId: string) {
  try {
    return quote(slug, selection);
  } catch {
    return quote(slug, { kind: "package", packageId: fallbackPackageId });
  }
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
