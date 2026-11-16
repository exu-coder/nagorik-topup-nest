import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  ChevronRight,
  Crown,
  Gamepad2,
  Gem,
  Rocket,
  ShieldCheck,
  Sparkles,
  Timer,
  Wallet,
  Zap,
} from "lucide-react";

import pearlStage from "@/assets/pearl-stage.webp.asset.json";
import { BrandLogo } from "@/components/site/brand-logo";
import { PayLogos } from "@/components/site/pay-logos";
import { Button } from "@/components/ui/button";
import { CATEGORIES, formatTaka, type CategorySlug } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MFJ TOP UP — Free Fire Likes, Guild Glory & TCP Bot" },
      {
        name: "description",
        content:
          "MFJ TOP UP: ২০০ Free Fire লাইক মাত্র ৳4। Guild Glory ও TCP Bot — bKash, Nagad, Rocket দিয়ে অটো পেমেন্ট।",
      },
      { property: "og:title", content: "MFJ TOP UP — The Player's Destination" },
      {
        property: "og:description",
        content: "Free Fire Likes, Guild Glory ও TCP Bot — সেরা দামে, অটো পেমেন্টে।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

/** Home grid order: two banners side by side, the wide one below. */
const ORDER: { slug: CategorySlug; wide?: boolean }[] = [
  { slug: "freefire-likes" },
  { slug: "tcp-bot" },
  { slug: "guild-glory", wide: true },
];

const perks = [
  { icon: Zap, label: "অটো পেমেন্ট" },
  { icon: Timer, label: "দ্রুত ডেলিভারি" },
  { icon: ShieldCheck, label: "১০০% নিরাপদ" },
];

const steps = [
  { icon: BadgeCheck, title: "প্যাকেজ বাছুন", text: "Likes, Glory বা TCP Bot" },
  { icon: Wallet, title: "অটো পেমেন্ট", text: "bKash · Nagad · Rocket" },
  { icon: Rocket, title: "ডেলিভারি", text: "পেমেন্ট কনফার্ম হলেই শুরু" },
];

function Index() {
  return (
    <div>
      <Hero />

      <div className="mx-auto max-w-5xl px-4">
        {/* Perks strip */}
        <ul className="surface -mt-2 grid grid-cols-3 divide-x divide-border rounded-2xl">
          {perks.map((p, i) => (
            <li
              key={p.label}
              style={{ "--d": `${500 + i * 120}ms` } as React.CSSProperties}
              className="flex animate-rise flex-col items-center gap-1.5 px-2 py-3 text-center"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-violet/10 text-violet">
                <p.icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-semibold">{p.label}</span>
            </li>
          ))}
        </ul>

        {/* Categories */}
        <section id="shop" className="scroll-mt-24 pt-12">
          <SectionTitle eyebrow="Shop" title="Free Fire Category" />
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5">
            {ORDER.map(({ slug, wide }, i) => {
              const c = CATEGORIES.find((x) => x.slug === slug);
              if (!c) return null;
              const from = Math.min(...c.packages.map((p) => p.price));
              return (
                <div key={c.slug} className={cn("reveal relative", wide && "col-span-2")}>
                  {/* pin + string */}
                  <span className="absolute -top-5 left-1/2 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-card bg-muted-foreground shadow-soft" />
                  <div
                    className="animate-sway hover:[animation-play-state:paused]"
                    style={{ animationDelay: `${i * -1.7}s` }}
                  >
                    <span className="absolute -top-3.5 left-1/2 h-4 w-px -translate-x-1/2 bg-muted-foreground/50" />
                    <Link
                      to="/category/$slug"
                      params={{ slug: c.slug }}
                      className="group surface block overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                    >
                      <div
                        className={cn(
                          "shimmer relative overflow-hidden bg-muted",
                          wide ? "aspect-[16/8]" : "aspect-[4/3]",
                        )}
                        style={{ "--d": `${i * 900}ms` } as React.CSSProperties}
                      >
                        <img
                          src={c.image}
                          alt={c.name}
                          loading={i < 2 ? "eager" : "lazy"}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <span className="absolute left-2 top-2 rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-bold text-primary shadow-soft backdrop-blur">
                          from {formatTaka(from)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 p-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-[15px] font-bold leading-tight sm:text-lg">
                            {c.name}
                          </h3>
                          <p className="truncate text-xs text-muted-foreground">
                            {c.packages.length} packages · {c.tagline}
                          </p>
                        </div>
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:rotate-45 group-hover:bg-primary group-hover:text-primary-foreground">
                          <ArrowUpRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Payment */}
        <section className="reveal pt-14">
          <div className="surface relative overflow-hidden rounded-3xl p-5">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet/15 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-violet">
                  Instant Pay
                </p>
                <h2 className="mt-1 text-xl font-bold">অটো পেমেন্ট, কোনো ঝামেলা নেই</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  পেমেন্ট সম্পন্ন হলে অর্ডার নিজে থেকেই কনফার্ম হয় — স্ক্রিনশট বা TrxID পাঠাতে হয় না।
                </p>
              </div>
              <ShieldCheck className="h-7 w-7 shrink-0 text-violet" />
            </div>
            <PayLogos className="relative mt-5" />
          </div>
        </section>

        {/* How it works */}
        <section className="pt-14">
          <SectionTitle eyebrow="Easy" title="How it works" />
          <ol className="relative mt-6 grid gap-3 sm:grid-cols-3">
            <span className="absolute bottom-6 left-[2.15rem] top-6 w-px bg-gradient-to-b from-violet/0 via-violet/40 to-violet/0 sm:hidden" />
            {steps.map((s, i) => (
              <li key={s.title} className="reveal surface relative flex items-center gap-4 rounded-2xl p-4">
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-violet text-violet-foreground shadow-violet">
                  <s.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-xs font-semibold text-violet">STEP 0{i + 1}</p>
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="reveal pt-12">
          <Link
            to="/category/$slug"
            params={{ slug: "freefire-likes" }}
            className="group glossy flex items-center justify-between gap-4 rounded-3xl p-5"
          >
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
                Today's deal
              </p>
              <p className="mt-1 font-display text-2xl font-bold">২০০ লাইক মাত্র ৳4</p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-card/20 transition-transform group-hover:translate-x-1">
              <ChevronRight className="h-5 w-5" />
            </span>
          </Link>
        </section>
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="reveal text-center">
      <p className="inline-flex items-center gap-2 font-display text-[11px] font-semibold uppercase tracking-[0.25em] text-violet">
        <span className="h-px w-6 bg-violet/40" />
        {eyebrow}
        <span className="h-px w-6 bg-violet/40" />
      </p>
      <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h2>
    </div>
  );
}

function Hero() {
  const chips = [
    { icon: Gem, pos: "left-[6%] top-[14%]", delay: "0s" },
    { icon: Crown, pos: "right-[4%] top-[48%]", delay: "-1.3s" },
    { icon: Zap, pos: "left-[18%] bottom-[2%]", delay: "-2.4s" },
  ];
  return (
    <section className="relative -mt-16 overflow-hidden pt-20">
      {/* Pearl stage backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img
          src={pearlStage.url}
          alt=""
          className="opacity-stage absolute right-0 top-0 h-[78%] w-full object-cover object-[78%_center] sm:h-full"
        />
        <div className="absolute inset-0 bg-stage-fade" />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-10 sm:flex sm:flex-row-reverse sm:items-center sm:gap-10">
        {/* Logo card with orbit */}
        <div className="relative mx-auto h-60 w-full max-w-[320px] sm:h-80 sm:max-w-[380px]">
          <div className="absolute inset-x-2 top-1/2 h-36 -translate-y-1/2 rounded-[50%] border border-primary/25 sm:h-44" />
          <div className="absolute inset-0 animate-spin-slow">
            <span className="absolute left-1/2 top-[18%] h-2 w-2 rounded-full bg-violet/60" />
            <span className="absolute bottom-[20%] right-[10%] h-1.5 w-1.5 rounded-full bg-primary/60" />
          </div>
          {chips.map((c) => (
            <span
              key={c.pos}
              style={{ animationDelay: c.delay }}
              className={cn(
                "surface absolute z-10 grid h-10 w-10 animate-bob place-items-center rounded-xl text-primary",
                c.pos,
              )}
            >
              <c.icon className="h-5 w-5" />
            </span>
          ))}
          <div
            className="absolute left-1/2 top-1/2 -ml-[78px] -mt-[78px] animate-float sm:-ml-[100px] sm:-mt-[100px]"
            style={{ "--tilt": "-8deg" } as React.CSSProperties}
          >
            <div className="absolute inset-0 translate-x-3 translate-y-3 rotate-6 rounded-3xl border border-border bg-card/70 shadow-soft" />
            <div className="relative grid h-[156px] w-[156px] place-items-center overflow-hidden rounded-3xl border-4 border-card bg-foreground shadow-lift sm:h-[200px] sm:w-[200px] dark:bg-secondary">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,var(--destructive),transparent_65%)] opacity-40" />
              <BrandLogo eager className="relative h-[86%] w-[86%] drop-shadow-xl" />
            </div>
          </div>
        </div>

        <div className="sm:flex-1">
          <span
            className="inline-flex animate-rise items-center gap-2 rounded-full border border-destructive/30 bg-card/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-destructive backdrop-blur"
            style={{ "--d": "100ms" } as React.CSSProperties}
          >
            <span className="h-1.5 w-1.5 animate-ping-soft rounded-full bg-success" />
            The player's destination
          </span>
          <h1
            className="mt-3 animate-rise text-[44px] font-bold leading-[1.05] sm:text-6xl"
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            MFJ <span className="text-brand">TOP UP</span>
          </h1>
          <p
            className="mt-2 animate-rise text-lg font-semibold"
            style={{ "--d": "260ms" } as React.CSSProperties}
          >
            Everything you need, at the lowest price
          </p>
          <p
            className="mt-1 max-w-md animate-rise text-[15px] text-muted-foreground"
            style={{ "--d": "320ms" } as React.CSSProperties}
          >
            Free Fire Likes, Guild Glory ও TCP Bot — সবচেয়ে কম দামে, অটো পেমেন্টে, দ্রুত ডেলিভারি।
          </p>
          <div
            className="mt-6 flex max-w-sm animate-rise gap-3"
            style={{ "--d": "400ms" } as React.CSSProperties}
          >
            <Button asChild variant="glossy" size="xl" className="flex-[1.4]">
              <a href="#shop">
                Explore the shop <ArrowUpRight />
              </a>
            </Button>
            <Button asChild variant="pearl" size="xl" className="flex-1">
              <Link to="/category/$slug" params={{ slug: "freefire-likes" }}>
                FF LIKE <Gamepad2 className="text-primary" />
              </Link>
            </Button>
          </div>
          <p
            className="mt-4 flex animate-rise items-center gap-1.5 text-xs text-muted-foreground"
            style={{ "--d": "480ms" } as React.CSSProperties}
          >
            <Sparkles className="h-3.5 w-3.5 text-violet" /> ২০০ লাইক মাত্র ৳4 — প্রতিদিন
          </p>
        </div>
      </div>
    </section>
  );
}
