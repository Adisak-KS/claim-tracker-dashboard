"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
 *
 * 🔴 รายการต้องวาดผ่าน portal ไปที่ body ไม่ใช่วางในกล่องตัวเอง
 * เพราะการ์ดที่ครอบอยู่มี overflow-hidden ซึ่งจะตัดรายการที่ล้นออกนอกกล่องทิ้ง
 * ไม่ว่าจะใส่ z-index สูงแค่ไหนก็ไม่ช่วย เพราะมันคนละเรื่องกัน
 */
const MENU_MAX_HEIGHT = 256;
const MENU_GAP = 4;

interface MenuPosition {
  top: number;
  left: number;
  width: number;
  /** เปิดขึ้นบนเมื่อที่ว่างด้านล่างไม่พอ เช่นตอนอยู่ท้ายหน้า */
  dropUp: boolean;
}

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
  const [position, setPosition] = useState<MenuPosition | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropUp = spaceBelow < MENU_MAX_HEIGHT && rect.top > spaceBelow;

    setPosition({
      top: dropUp ? rect.top - MENU_GAP : rect.bottom + MENU_GAP,
      left: rect.left,
      width: rect.width,
      dropUp,
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePosition();

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    // ตำแหน่งคิดจากจอ ถ้าผู้ใช้เลื่อนหรือย่อจอต้องคำนวณใหม่ ไม่งั้นเมนูจะลอยค้าง
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, updatePosition]);

  const menu =
    open && position ? (
      <ul
        ref={menuRef}
        id={listId}
        role="listbox"
        aria-label={ariaLabel}
        style={{
          position: "fixed",
          top: position.dropUp ? undefined : position.top,
          bottom: position.dropUp
            ? window.innerHeight - position.top
            : undefined,
          left: position.left,
          minWidth: position.width,
          maxHeight: MENU_MAX_HEIGHT,
        }}
        className="animate-pop z-50 overflow-y-auto rounded-[var(--radius)] border border-border bg-surface p-1 shadow-lg"
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
    ) : null;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
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

      {typeof document !== "undefined" && menu
        ? createPortal(menu, document.body)
        : null}
    </div>
  );
}
