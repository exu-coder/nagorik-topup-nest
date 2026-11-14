import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

import { BrandLogo } from "./brand-logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 rounded-2xl border border-border bg-card/80 px-3 py-2 shadow-card backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandLogo eager className="h-10 w-10" />
          <span className="font-display text-lg font-bold leading-none tracking-wide">
            MFJ <span className="text-gradient-gold">TOP UP</span>
          </span>
        </Link>
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-gold" />
          Auto payment
        </span>
      </div>
    </header>
  );
}
