"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

/**
 * dropdown ที่วาดเอง ไม่ใช้ <select> ของเบราว์เซอร์
 *
 * เหตุผล: ตัวเลือกใน <select> แต่งด้วย CSS ไม่ได้ ระบบปฏิบัติการวาดให้เอง
 * บน Windows จะได้ไฮไลต์เทากับกรอบน้ำเงินของระบบ ซึ่งไม่ใช่สีแบรนด์
 * และไม่เปลี่ยนตามโหมดมืดด้วย
 */
interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** ใช้ผูกกับ label ข้างนอกเพื่อให้ screen reader อ่านได้ว่าเลือกอะไรอยู่ */
  ariaLabel: string;
  className?: string;
  buttonClassName?: string;
}

export function Select({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  buttonClassName,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        className={cn(
          "flex h-9 w-full cursor-pointer items-center justify-between gap-2 rounded-[var(--radius)] border border-border-strong bg-surface px-2.5 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2",
          open && "border-primary",
          buttonClassName,
        )}
      >
        <span className="truncate">{selected?.label ?? "เลือก"}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="animate-pop absolute z-50 mt-1 max-h-64 w-full min-w-max overflow-y-auto rounded-[var(--radius)] border border-border bg-surface p-1 shadow-lg"
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between gap-2 rounded-[calc(var(--radius)-2px)] px-2.5 py-1.5 text-left text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground hover:bg-surface-muted",
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {active && <Check className="size-3.5 shrink-0" aria-hidden />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
