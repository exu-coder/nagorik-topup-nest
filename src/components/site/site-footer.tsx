import { BrandLogo } from "./brand-logo";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 max-w-5xl px-4 pb-28 text-center">
      <BrandLogo className="mx-auto h-16 w-16 opacity-90" />
      <p className="mt-3 text-sm text-muted-foreground">
        MFJ TOP UP · সেরা দামে সেরা গেমিং সার্ভিস, গেমারদের বিশ্বস্ত ঠিকানা।
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        © {new Date().getFullYear()} MFJ TOP UP. Not affiliated with Garena.
      </p>
    </footer>
  );
}
