import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, BadgeCheck, CreditCard, Rocket, Zap } from "lucide-react";

import { BrandLogo } from "@/components/site/brand-logo";
import { Button } from "@/components/ui/button";
import { CATEGORIES, formatTaka } from "@/lib/catalog";

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

const steps = [
  { icon: BadgeCheck, title: "প্যাকেজ বাছুন", text: "Likes, Glory বা TCP Bot" },
  { icon: CreditCard, title: "অটো পেমেন্ট", text: "bKash · Nagad · Rocket" },
  { icon: Rocket, title: "ডেলিভারি", text: "পেমেন্ট কনফার্ম হলেই শুরু" },
];

function Index() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="relative flex flex-col items-center pt-8 text-center">
        <div className="absolute inset-x-10 top-10 -z-10 h-56 rounded-full bg-primary/30 blur-3xl" />
        <BrandLogo eager className="h-52 w-52 animate-float-slow drop-shadow-2xl sm:h-64 sm:w-64" />
        <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> The player's destination
        </span>
        <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
          MFJ <span className="text-gradient-gold">TOP UP</span>
        </h1>
        <p className="mt-3 max-w-md text-base text-muted-foreground">
          Free Fire Likes, Guild Glory ও TCP Bot — সবচেয়ে কম দামে, অটো পেমেন্টে, দ্রুত ডেলিভারি।
        </p>
        <div className="mt-6 flex w-full max-w-sm gap-3">
          <Button asChild variant="gold" size="xl" className="flex-1 shine">
            <a href="#shop">
              Shop now <ArrowUpRight />
            </a>
          </Button>
          <Button asChild variant="outline" size="xl" className="flex-1 bg-secondary">
            <Link to="/category/$slug" params={{ slug: "freefire-likes" }}>
              <Zap className="text-gold" /> ৳4 Likes
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories */}
      <section id="shop" className="scroll-mt-24 pt-14">
        <h2 className="text-center text-2xl font-bold">Free Fire Category</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {CATEGORIES.map((c) => {
            const from = Math.min(...c.packages.map((p) => p.price));
            return (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="group overflow-hidden rounded-2xl border border-border bg-gradient-card shadow-card transition-transform hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={c.image}
                    alt={c.name}
                    width={800}
                    height={600}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs font-semibold text-gold backdrop-blur">
                    from {formatTaka(from)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <h3 className="text-lg font-bold uppercase">{c.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {c.packages.length} packages · {c.tagline}
                    </p>
                  </div>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="pt-14">
        <h2 className="text-center text-2xl font-bold">How it works</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-crimson text-primary-foreground">
                <s.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-xs font-semibold text-gold">0{i + 1}</p>
                <p className="font-semibold">{s.title}</p>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
