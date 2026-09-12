"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
  buildMonthGrid,
  formatRangeLabel,
  formatThaiMonthYear,
  isSameDay,
  matchPreset,
  RANGE_PRESETS,
  THAI_WEEKDAYS_SHORT,
  type DateRange,
} from "@/lib/date-range";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

/** ยุบปุ่มลัดกับปฏิทินไว้ในปุ่มเดียว แถวบนจึงเหลือของน้อยชิ้น อ่านง่ายขึ้น */
export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMonth, setViewMonth] = useState(() => new Date(value.from));
  const [pendingFrom, setPendingFrom] = useState<Date | null>(null);
  const [hovered, setHovered] = useState<Date | null>(null);

  const activePreset = matchPreset(value);
  const presetLabel = RANGE_PRESETS.find((p) => p.id === activePreset)?.label;

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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

  function handleToggle() {
    setViewMonth(new Date(value.from));
    setPendingFrom(null);
    setHovered(null);
    setOpen(!open);
  }

  function handlePreset(range: DateRange) {
    onChange(range);
    setPendingFrom(null);
    setOpen(false);
  }

  function handlePick(day: Date) {
    if (!pendingFrom) {
      setPendingFrom(day);
      return;
    }

    // คลิกย้อนไปก่อนวันแรก ให้สลับด้านให้เอง ผู้ใช้ไม่ต้องเริ่มเลือกใหม่
    const [from, to] =
      day < pendingFrom ? [day, pendingFrom] : [pendingFrom, day];

    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    onChange({ from: start, to: end });
    setPendingFrom(null);
    setOpen(false);
  }

  function inPreview(day: Date): boolean {
    if (!pendingFrom || !hovered) return false;
    const lo = pendingFrom < hovered ? pendingFrom : hovered;
    const hi = pendingFrom < hovered ? hovered : pendingFrom;
    return day >= lo && day <= hi;
  }

  const grid = buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth());
  const today = new Date();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex cursor-pointer items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-sm transition-colors hover:bg-surface-muted"
      >
        <CalendarDays
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden
        />
        <span className="font-medium text-foreground">
          {presetLabel ?? formatRangeLabel(value)}
        </span>
        {presetLabel && (
          <span className="hidden text-muted-foreground sm:inline">
            {formatRangeLabel(value)}
          </span>
        )}
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className="absolute left-0 z-50 mt-1 flex w-[17rem] flex-col rounded-[var(--radius)] border border-border bg-surface shadow-lg sm:w-[26rem] sm:flex-row"
          role="dialog"
          aria-label="เลือกช่วงวันที่"
        >
          <div className="flex shrink-0 flex-wrap gap-0.5 border-b border-border p-2 sm:w-36 sm:flex-col sm:flex-nowrap sm:border-b-0 sm:border-r">
            {RANGE_PRESETS.map((preset) => {
              const active = activePreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePreset(preset.resolve())}
                  aria-pressed={active}
                  className={cn(
                    "cursor-pointer rounded px-2.5 py-1.5 text-left text-sm transition-colors",
                    active
                      ? "bg-info-surface font-medium text-primary"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          <div className="min-w-0 flex-1 p-3">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() - 1,
                      1,
                    ),
                  )
                }
                className="cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                aria-label="เดือนก่อนหน้า"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>

              <span className="text-sm font-medium text-foreground">
                {formatThaiMonthYear(viewMonth)}
              </span>

              <button
                type="button"
                onClick={() =>
                  setViewMonth(
                    new Date(
                      viewMonth.getFullYear(),
                      viewMonth.getMonth() + 1,
                      1,
                    ),
                  )
                }
                className="cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                aria-label="เดือนถัดไป"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-0.5">
              {THAI_WEEKDAYS_SHORT.map((day) => (
                <span
                  key={day}
                  className="py-1 text-center text-[0.6875rem] font-medium text-muted-foreground"
                >
                  {day}
                </span>
              ))}
            </div>

            <div
              className="grid grid-cols-7 gap-0.5"
              onMouseLeave={() => setHovered(null)}
            >
              {grid.map((day, index) => {
                if (!day) return <span key={index} />;

                const selected = day >= value.from && day <= value.to;
                const preview = inPreview(day);
                const isStart =
                  pendingFrom !== null && isSameDay(day, pendingFrom);
                const isToday = isSameDay(day, today);
                const isEdge =
                  isSameDay(day, value.from) || isSameDay(day, value.to);
                const highlighted = isEdge || isStart;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePick(day)}
                    onMouseEnter={() => setHovered(day)}
                    aria-label={
                      formatThaiMonthYear(day) + " วันที่ " + day.getDate()
                    }
                    aria-pressed={selected}
                    className={cn(
                      "relative h-8 cursor-pointer rounded text-sm transition-colors",
                      !selected &&
                        !preview &&
                        !highlighted &&
                        "text-foreground hover:bg-surface-muted",
                      (preview || (selected && !isEdge)) &&
                        "bg-info-surface text-info",
                      highlighted && "bg-primary font-medium text-on-primary",
                    )}
                  >
                    {day.getDate()}
                    {isToday && (
                      <span
                        className={cn(
                          "absolute inset-x-0 bottom-1 mx-auto block size-1 rounded-full",
                          highlighted ? "bg-on-primary" : "bg-primary",
                        )}
                        aria-hidden
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {pendingFrom && (
              <p className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                เลือกวันสิ้นสุด (กดวันเดิมซ้ำถ้าต้องการวันเดียว)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
