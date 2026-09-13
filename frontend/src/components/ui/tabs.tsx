"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TabOption {
  value: string;
  label: string;
  icon?: LucideIcon;
}

/**
 * สลับมุมมองของข้อมูลชุดเดียวกัน ไม่ใช่การนำทางไปหน้าอื่น
 *
 * ใช้ role="tablist" เพื่อให้โปรแกรมอ่านหน้าจอบอกได้ว่ามีกี่มุมมอง
 * และอยู่มุมมองที่เท่าไร ซึ่งปุ่มธรรมดาบอกไม่ได้
 */
export function Tabs({
  value,
  options,
  onChange,
  ariaLabel,
  className,
}: {
  value: string;
  options: TabOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex gap-1 rounded-[var(--radius)] bg-surface-muted p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex cursor-pointer items-center gap-1.5 rounded-[calc(var(--radius)-2px)] px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon className="size-4" aria-hidden />}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
