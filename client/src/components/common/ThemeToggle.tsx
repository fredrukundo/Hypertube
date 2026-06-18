"use client";

import { Moon, Sun } from "lucide-react";
import { useUIStore } from "@/store/ui.store";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useUIStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-9 h-9 flex items-center justify-center rounded-xl border-2 border-border bg-card text-foreground hover:border-[#2872A1] hover:text-[#2872A1] transition-all duration-200"
    >
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}