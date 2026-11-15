import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export const THEME_KEY = "mfj-theme";

/** Runs before paint (inlined in <head>) so night mode never flashes pearl first. */
export const themeBootScript = `try{if(localStorage.getItem("${THEME_KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      /* private mode: theme just won't persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={dark}
      aria-label="Night mode"
      className={cn(
        "relative h-8 w-[60px] shrink-0 overflow-hidden rounded-full border border-border transition-colors duration-500",
        dark ? "bg-primary/25" : "bg-primary/15",
      )}
    >
      {/* clouds / stars */}
      <span
        className={cn(
          "absolute inset-y-0 right-1.5 flex items-center gap-0.5 transition-all duration-500",
          dark ? "translate-x-6 opacity-0" : "opacity-100",
        )}
      >
        <span className="h-3 w-3 rounded-full bg-card" />
        <span className="-ml-1.5 mt-1 h-2.5 w-2.5 rounded-full bg-card" />
      </span>
      <span
        className={cn(
          "absolute left-2 top-1.5 h-1 w-1 rounded-full bg-foreground/70 transition-opacity duration-500",
          dark ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute left-4 top-4 h-0.5 w-0.5 rounded-full bg-foreground/70 transition-opacity duration-500",
          dark ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        className={cn(
          "absolute top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full shadow-soft transition-all duration-500 ease-[cubic-bezier(.5,1.6,.4,1)]",
          dark ? "left-[30px] bg-card text-violet" : "left-1 bg-sun text-gold-foreground",
        )}
      >
        {dark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-gold" />}
      </span>
    </button>
  );
}
