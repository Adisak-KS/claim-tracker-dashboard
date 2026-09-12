"use client";

import { useState } from "react";
import { ChevronDown, LogOut, Menu, Moon, Sun } from "lucide-react";
import { ROLE_LABEL, type SessionUser } from "@/lib/auth/roles";

interface TopbarProps {
  user: SessionUser;
  title: string;
  onOpenMobileNav: () => void;
}

export function Topbar({ user, title, onOpenMobileNav }: TopbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface px-4">
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-surface-muted lg:hidden"
        aria-label="เปิดเมนู"
      >
        <Menu className="size-5" aria-hidden />
      </button>

      <h1 className="truncate text-base font-semibold text-foreground">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          onClick={toggleTheme}
          className="cursor-pointer rounded p-2 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
          aria-label={dark ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
        >
          {dark ? (
            <Sun className="size-[1.125rem]" aria-hidden />
          ) : (
            <Moon className="size-[1.125rem]" aria-hidden />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex cursor-pointer items-center gap-2 rounded-[var(--radius)] px-2 py-1.5 hover:bg-surface-muted"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-on-primary">
              {user.displayName.slice(0, 1)}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-medium text-foreground">
                {user.displayName}
              </span>
              <span className="block text-xs text-muted-foreground">
                {ROLE_LABEL[user.role]}
              </span>
            </span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-1 w-52 rounded-[var(--radius)] border border-border bg-surface py-1 shadow-lg"
              role="menu"
            >
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-medium text-foreground">
                  {user.displayName}
                </p>
                <p className="text-xs text-muted-foreground">{user.username}</p>
              </div>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-surface-muted"
                role="menuitem"
              >
                <LogOut className="size-4" aria-hidden />
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
