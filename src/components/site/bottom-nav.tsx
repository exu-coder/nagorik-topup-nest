import { Link } from "@tanstack/react-router";
import { Bot, Heart, Home, Plus, Trophy } from "lucide-react";

const tile =
  "grid h-9 w-11 place-items-center rounded-xl border border-border bg-secondary/70 shadow-soft transition-all duration-300 group-hover:-translate-y-0.5 group-data-[status=active]:border-primary/30 group-data-[status=active]:bg-primary/12 group-data-[status=active]:text-primary";
const linkClass =
  "group flex flex-col items-center gap-1 pb-2 pt-2.5 text-[11px] font-semibold text-muted-foreground transition-colors data-[status=active]:text-foreground";

const side = [
  { slug: "freefire-likes", label: "Likes", icon: Heart },
  { slug: "guild-glory", label: "Glory", icon: Trophy },
  { slug: "tcp-bot", label: "TCP Bot", icon: Bot },
] as const;

function CatLink({ item }: { item: (typeof side)[number] }) {
  const Icon = item.icon;
  return (
    <Link to="/category/$slug" params={{ slug: item.slug }} className={linkClass}>
      <span className={tile}>
        <Icon className="h-[18px] w-[18px]" />
      </span>
      {item.label}
    </Link>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] shadow-lift backdrop-blur-xl">
      <ul className="mx-auto grid max-w-md grid-cols-5 items-end">
        <li>
          <Link to="/" activeOptions={{ exact: true, includeHash: false }} className={linkClass}>
            <span className={tile}>
              <Home className="h-[18px] w-[18px]" />
            </span>
            Home
          </Link>
        </li>
        <li>
          <CatLink item={side[0]} />
        </li>
        <li className="flex justify-center">
          <Link
            to="/"
            hash="shop"
            aria-label="Top up now"
            className="group -mt-7 flex flex-col items-center gap-1 pb-2 text-[11px] font-semibold text-foreground"
          >
            <span className="glossy grid h-14 w-14 place-items-center rounded-2xl ring-4 ring-card transition-transform duration-300 group-hover:-translate-y-1 group-active:scale-95">
              <Plus className="h-6 w-6" />
            </span>
            Top Up
          </Link>
        </li>
        <li>
          <CatLink item={side[1]} />
        </li>
        <li>
          <CatLink item={side[2]} />
        </li>
      </ul>
    </nav>
  );
}
