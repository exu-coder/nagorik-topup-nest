import bkash from "@/assets/pay-bkash.webp.asset.json";
import nagad from "@/assets/pay-nagad.webp.asset.json";
import rocket from "@/assets/pay-rocket.webp.asset.json";
import { cn } from "@/lib/utils";

export const PAY_METHODS = [
  { name: "bKash", src: bkash.url },
  { name: "Nagad", src: nagad.url },
  { name: "Rocket", src: rocket.url },
] as const;

export function PayLogos({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {PAY_METHODS.map((m, i) => (
        <span
          key={m.name}
          style={{ animationDelay: `${i * 0.4}s` }}
          className={cn(
            "flex animate-bob items-center justify-center overflow-hidden rounded-xl border border-border bg-card shadow-soft dark:bg-foreground",
            size === "sm" ? "h-8 w-12 p-1" : "h-11 w-16 p-1.5",
          )}
        >
          <img src={m.src} alt={m.name} loading="lazy" className="h-full w-full object-contain" />
        </span>
      ))}
    </div>
  );
}
