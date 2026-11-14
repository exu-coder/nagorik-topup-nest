import { Link } from "@tanstack/react-router";
import { Bot, Heart, Home, Trophy } from "lucide-react";

const items = [
  { slug: null, label: "Home", icon: Home },
  { slug: "freefire-likes", label: "Likes", icon: Heart },
  { slug: "guild-glory", label: "Glory", icon: Trophy },
  { slug: "tcp-bot", label: "TCP Bot", icon: Bot },
] as const;

const linkClass =
  "group flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted-foreground transition-colors data-[status=active]:text-gold";

function NavIcon({ icon: Icon }: { icon: typeof Home }) {
  return (
    <span className="grid h-8 w-12 place-items-center rounded-xl transition-colors group-data-[status=active]:bg-gold/15">
      <Icon className="h-5 w-5" />
    </span>
  );
}

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map((item) => (
          <li key={item.label}>
            {item.slug ? (
              <Link to="/category/$slug" params={{ slug: item.slug }} className={linkClass}>
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            ) : (
              <Link to="/" activeOptions={{ exact: true }} className={linkClass}>
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
