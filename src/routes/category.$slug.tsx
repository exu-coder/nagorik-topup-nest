import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Calculator, Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

  const current = quote(slug, selection);
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

  return (
    <div className="mx-auto max-w-3xl px-4 pt-4">
      <div className="flex items-center gap-2 text-sm">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">{category.name}</span>
      </div>

      {/* Intro */}
      <section className="mt-5 flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            MFJ Collection
          </p>
          <h1 className="mt-1 text-3xl font-bold leading-tight">{category.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
        </div>
        <img
          src={category.image}
          alt={category.name}
          width={800}
          height={600}
          className="h-24 w-28 shrink-0 rotate-3 rounded-xl border border-gold/30 object-cover shadow-glow-gold"
        />
      </section>

      {/* Packages */}
      <section className="mt-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-display text-xs font-semibold text-primary">01 / PACKAGES</p>
            <h2 className="text-xl font-bold">Choose your package</h2>
          </div>
          <span className="font-display text-4xl font-bold text-muted-foreground/30">
            {String(category.packages.length).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {category.packages.map((p) => {
            const active = selection.kind === "package" && selection.packageId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelection({ kind: "package", packageId: p.id })}
                className={cn(
                  "relative rounded-2xl border bg-gradient-card p-4 text-left transition-all",
                  active ? "border-gold shadow-glow-gold" : "border-border hover:border-gold/40",
                )}
              >
                <span
                  className={cn(
                    "absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border",
                    active ? "border-gold bg-gold text-gold-foreground" : "border-border",
                  )}
                >
                  {active && <Check className="h-3 w-3" />}
                </span>
                <p className="font-display text-lg font-bold">{p.title}</p>
                <p className="text-sm font-medium text-primary">{p.detail}</p>
                <p className="mt-3 font-display text-2xl font-bold text-gradient-gold">
                  {formatTaka(p.price)}
                </p>
              </button>
            );
          })}
        </div>

        {category.custom && (
          <div
            className={cn(
              "mt-3 rounded-2xl border bg-gradient-card p-4 transition-all",
              selection.kind === "custom" ? "border-gold shadow-glow-gold" : "border-border",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="font-display font-bold uppercase">Custom {category.custom.unitLabel}</p>
              <Calculator className="h-5 w-5 text-gold" />
            </div>
            <Slider
              className="mt-5"
              min={category.custom.min}
              max={category.custom.max}
              step={category.custom.step}
              value={[customQty]}
              onValueChange={([v]) => v !== undefined && pickCustom(v)}
              aria-label={`Custom ${category.custom.unitLabel}`}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {category.custom.presets.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => pickCustom(q)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors",
                    selection.kind === "custom" && customQty === q
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-secondary hover:border-gold/40",
                  )}
                >
                  {q.toLocaleString("en-US")}
                </button>
              ))}
            </div>
            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <div>
                <p className="font-display text-3xl font-bold">
                  {customQty.toLocaleString("en-US")}{" "}
                  <span className="text-sm text-muted-foreground">{category.custom.unitLabel}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTaka(category.custom.pricePerStep)} / {category.custom.step}{" "}
                  {category.custom.unitLabel}
                </p>
              </div>
              <p className="font-display text-3xl font-bold text-gradient-gold">
                {formatTaka((customQty / category.custom.step) * category.custom.pricePerStep)}
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Checkout */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-xs font-semibold text-primary">02 / CHECKOUT</p>
            <h2 className="text-xl font-bold">Make it yours</h2>
          </div>
          <ShieldCheck className="h-6 w-6 text-gold" />
        </div>

        <div className="mt-4 space-y-4">
          <Field label={category.targetLabel} htmlFor="target" error={targetId && !idValid ? "শুধু সংখ্যা, ৫–১৫ ডিজিট" : undefined}>
            <Input
              id="target"
              inputMode="numeric"
              placeholder={category.targetPlaceholder}
              value={targetId}
              onChange={(e) => setTargetId(e.target.value.replace(/\D/g, ""))}
              className="h-12 text-base"
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" htmlFor="name">
              <Input id="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="h-12 text-base" />
            </Field>
            <Field label="Email (for receipt)" htmlFor="email" error={email && !emailValid ? "Valid email দিন" : undefined}>
              <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 text-base" />
            </Field>
          </div>
          <Field label="WhatsApp number (optional)" htmlFor="phone" error={!phoneValid ? "01 দিয়ে শুরু ১১ ডিজিট" : undefined}>
            <Input id="phone" inputMode="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))} className="h-12 text-base" />
          </Field>
        </div>

        <div className="mt-5 rounded-xl border border-gold/30 bg-gold/5 p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">You pay</p>
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm font-medium">{current.label}</p>
            <p className="font-display text-2xl font-bold text-gradient-gold">{formatTaka(current.amount)}</p>
          </div>
        </div>

        <Button variant="crimson" size="xl" className="mt-4 w-full" disabled={!canPay} onClick={pay}>
          {loading ? <Loader2 className="animate-spin" /> : <Lock />}
          {loading ? "Opening payment…" : `Pay ${formatTaka(current.amount)}`}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          bKash · Nagad · Rocket — NagorikPay দিয়ে নিরাপদ অটো পেমেন্ট
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="text-xl font-bold">সচরাচর জিজ্ঞাসা</h2>
        <Accordion type="single" collapsible className="mt-3 rounded-2xl border border-border bg-card px-4">
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
