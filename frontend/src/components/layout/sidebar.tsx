"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { NAV_SECTIONS } from "@/config/navigation";
import { canAccessRoute, type SessionUser } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: SessionUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  user,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-surface transition-[width,transform] duration-200",
          "lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0",
          collapsed ? "w-[4.5rem]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="เมนูหลัก"
      >
        <div className="flex h-14 items-center gap-2 border-b border-border px-3">
          <BrandMark collapsed={collapsed} />
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-surface-muted lg:hidden"
            aria-label="ปิดเมนู"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_SECTIONS.map((section) => {
            const visible = section.items.filter((item) =>
              canAccessRoute(user, item.roles),
            );
            if (visible.length === 0) return null;

            return (
              <div key={section.id} className="mb-4 last:mb-0">
                {section.title && !collapsed && (
                  <p className="px-3 pb-1.5 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.title}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {visible.map((item) => {
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onCloseMobile}
                          title={collapsed ? item.label : item.hint}
                          className={cn(
                            "flex items-center gap-3 rounded-[var(--radius)] px-3 py-2 text-sm transition-colors duration-150",
                            collapsed && "justify-center px-0",
                            active
                              ? "bg-info-surface font-medium text-primary"
                              : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                          )}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className="size-[1.125rem] shrink-0" aria-hidden />
                          {!collapsed && <span>{item.label}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden cursor-pointer items-center gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground hover:bg-surface-muted hover:text-foreground lg:flex"
          aria-label={collapsed ? "ขยายเมนู" : "ย่อเมนู"}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[1.125rem]" aria-hidden />
          ) : (
            <>
              <PanelLeftClose className="size-[1.125rem]" aria-hidden />
              <span>ย่อเมนู</span>
            </>
          )}
        </button>
      </aside>
    </>
  );
}

function BrandMark({ collapsed }: { collapsed: boolean }) {
  return (
    <Link href="/" className="flex min-w-0 items-center gap-2.5">
      <BmsLogo className="size-8 shrink-0" />
      {!collapsed && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-semibold text-foreground">
            ติดตามการส่งเคลม
          </span>
          <span className="block truncate text-[0.6875rem] text-muted-foreground">
            Bangkok Medical Software
          </span>
        </span>
      )}
    </Link>
  );
}

/** โลโก้ BMS หัวใจแดงกับเส้นโค้งน้ำเงิน วาดเป็น SVG ให้คมทุกความละเอียด */
export function BmsLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 58" className={className} role="img" aria-label="BMS">
      <path
        d="M32 55C13 41 3 31 3 19.5 3 10.4 10.2 3 19.2 3c5.4 0 10.3 2.7 12.8 7 2.5-4.3 7.4-7 12.8-7C53.8 3 61 10.4 61 19.5c0 4.6-1.6 8.8-4.6 13"
        fill="none"
        stroke="#E8232A"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M8 44c12 6 34 5 48-10"
        fill="none"
        stroke="#2B62B3"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M38 18c8-4 16-4 21 0"
        fill="none"
        stroke="#2B62B3"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}
