import logo from "@/assets/mfj-logo.webp";
import { cn } from "@/lib/utils";

export function BrandLogo({ className, eager }: { className?: string; eager?: boolean }) {
  return (
    <img
      src={logo}
      alt="MFJ TOP UP"
      width={512}
      height={487}
      loading={eager ? "eager" : "lazy"}
      className={cn("object-contain", className)}
    />
  );
}
