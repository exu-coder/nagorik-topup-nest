import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BrandLogo } from "./brand-logo";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div className="mx-auto flex max-w-5xl animate-rise items-center justify-between gap-2 rounded-full border border-border bg-card/85 py-1.5 pl-1.5 pr-2 shadow-soft backdrop-blur-xl">
        <Link to="/" className="group flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-foreground shadow-soft transition-transform duration-500 group-hover:rotate-[-8deg] dark:bg-secondary">
            <BrandLogo eager className="h-9 w-9" />
          </span>
          <span className="truncate font-display text-[17px] font-bold leading-none">
            MFJ <span className="text-primary">TOP UP</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="glossy" size="pill" className="px-3.5">
            <Link to="/" hash="shop">
              <Zap /> Top up
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
