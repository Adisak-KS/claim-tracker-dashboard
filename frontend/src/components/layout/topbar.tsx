"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, Menu, Moon, Sun } from "lucide-react";
import { ModalPortal } from "@/components/ui/modal-portal";
import { Button } from "@/components/ui/button";
import { ROLE_LABEL, type SessionUser } from "@/lib/auth/roles";

interface TopbarProps {
  user: SessionUser;
  title: string;
  onOpenMobileNav: () => void;
}

export function Topbar({ user, title, onOpenMobileNav }: TopbarProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
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
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmLogout(true);
                }}
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

      {confirmLogout && (
        <LogoutDialog
          onCancel={() => setConfirmLogout(false)}
          onConfirm={() => router.push("/login")}
        />
      )}
    </header>
  );
}

/** ถามก่อนเสมอ เพราะกดพลาดแล้วต้องเข้าระบบใหม่ ซึ่งเสียเวลากว่าการยืนยันหนึ่งครั้ง */
function LogoutDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <ModalPortal onClose={onCancel} label="ยืนยันการออกจากระบบ">
      <div
        className="animate-pop w-full max-w-sm rounded-[var(--radius)] border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
            <LogOut className="size-4 text-danger" aria-hidden />
            ออกจากระบบ
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            ระบบจะพากลับไปหน้าเข้าสู่ระบบ ต้องกรอกชื่อผู้ใช้และรหัสผ่านใหม่
            เพื่อเข้าใช้งานอีกครั้ง
          </p>
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-surface-muted/40 px-5 py-3">
          <Button variant="ghost" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button variant="danger" icon={LogOut} onClick={onConfirm}>
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </ModalPortal>
  );
}
