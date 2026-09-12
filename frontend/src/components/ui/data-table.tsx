"use client";

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * กรอบตารางมาตรฐาน ใช้ทุกที่ที่มีตาราง
 *
 * แก้ 3 เรื่องที่เคยพลาดมาแล้ว
 * 1. หัวตารางตกบรรทัด เพราะเคยตั้ง min-width เตี้ยกว่าที่คอลัมน์ต้องการ
 *    ตัวนี้คิดจากจำนวนคอลัมน์ให้ ไม่ต้องเดาเลขเอง
 * 2. เลื่อนลงไปแล้วลืมว่าคอลัมน์ไหนคืออะไร เพราะหัวตารางไม่ sticky
 * 3. กดหัวตารางแล้วไม่มีอะไรเกิดขึ้น ทั้งที่ผู้ใช้คาดหวังว่าจะเรียงได้
 */

/** กว้างพอให้หัวคอลัมน์ภาษาไทยอยู่บรรทัดเดียว วัดจากคอลัมน์จริงในระบบนี้ */
const WIDTH_PER_COLUMN_REM = 7.5;

/** คอลัมน์แรกเป็นชื่อหน่วยบริการเสมอ ต้องกว้างกว่าคอลัมน์ตัวเลข */
const FIRST_COLUMN_EXTRA_REM = 6;

export type SortDirection = "asc" | "desc";

export interface SortState {
  key: string;
  direction: SortDirection;
}

interface DataTableProps {
  /** จำนวนคอลัมน์จริง ใช้คำนวณความกว้างขั้นต่ำ */
  columns: number;
  children: ReactNode;
  className?: string;
}

export function DataTable({ columns, children, className }: DataTableProps) {
  const minWidth = columns * WIDTH_PER_COLUMN_REM + FIRST_COLUMN_EXTRA_REM;

  return (
    <div className="overflow-x-auto">
      <table
        className={cn("w-full border-separate border-spacing-0 text-sm", className)}
        style={{ minWidth: `${minWidth}rem` }}
      >
        {children}
      </table>
    </div>
  );
}

/**
 * หัวตารางลอยค้างตอนเลื่อน มี 3 กับดักที่ต้องทำครบทั้งหมด ขาดข้อเดียวก็พัง
 *
 * 1. 🔴 ตารางต้องเป็น border-separate ไม่ใช่ border-collapse
 *    ถ้า collapse เบราว์เซอร์จะไม่วาดพื้นหลังของเซลล์ที่ sticky ให้
 *    แถวข้อมูลจะมองทะลุขึ้นมาเห็นเป็นตัวหนังสือจาง ๆ ซ้อนหัวตาราง
 *    (border-separate ทำให้ต้องวาดเส้นคั่นด้วย box-shadow แทน border)
 * 2. sticky กับพื้นหลังต้องอยู่ที่ <th> ไม่ใช่ <thead>
 *    เบราว์เซอร์ไม่ทำ sticky ให้ <thead> ตรง ๆ มันเกาะที่เซลล์แต่ละตัว
 * 3. เว้น 3.5rem ให้พ้น Topbar ที่สูง h-14 ไม่งั้นหัวตารางจะมุดหายไปข้างใต้
 */
const STICKY_HEAD_CELL =
  "sticky top-14 z-20 bg-surface shadow-[inset_0_-1px_0_var(--border)]";

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="text-left text-xs text-muted-foreground">{children}</tr>
    </thead>
  );
}

interface ColumnProps {
  children: ReactNode;
  align?: "left" | "right" | "center";
  /** ใส่เมื่อคอลัมน์นี้เรียงได้ ต้องตรงกับคีย์ที่ API รองรับ */
  sortKey?: string;
  sort?: SortState;
  onSort?: (key: string) => void;
  className?: string;
}

const ALIGN_CLASS = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

const JUSTIFY_CLASS = {
  left: "justify-start",
  right: "justify-end",
  center: "justify-center",
} as const;

export function Column({
  children,
  align = "left",
  sortKey,
  sort,
  onSort,
  className,
}: ColumnProps) {
  const base = cn(
    STICKY_HEAD_CELL,
    "whitespace-nowrap px-4 py-2.5 font-medium",
    ALIGN_CLASS[align],
    className,
  );

  if (!sortKey || !onSort) {
    return <th className={base}>{children}</th>;
  }

  const active = sort?.key === sortKey;
  const Icon = !active
    ? ChevronsUpDown
    : sort.direction === "asc"
      ? ArrowUp
      : ArrowDown;

  return (
    <th
      className={cn(base, "px-0 py-0")}
      aria-sort={
        active
          ? sort.direction === "asc"
            ? "ascending"
            : "descending"
          : "none"
      }
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "flex w-full cursor-pointer items-center gap-1 px-4 py-2.5 transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2",
          JUSTIFY_CLASS[align],
          active && "text-foreground",
        )}
      >
        {children}
        <Icon
          className={cn(
            "size-3.5 shrink-0",
            active ? "text-primary" : "text-muted-foreground/60",
          )}
          aria-hidden
        />
      </button>
    </th>
  );
}

/**
 * แถวข้อมูล ใช้แทน <tr> ธรรมดา
 * ตารางเป็น border-separate เส้นคั่นจึงต้องวาดที่ <td> ไม่ใช่ที่ <tr>
 * เพราะ border ของ <tr> จะไม่ถูกวาดเมื่อ border-separate
 */
export function DataTableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-surface-muted [&>td]:border-b [&>td]:border-border last:[&>td]:border-0",
        className,
      )}
    >
      {children}
    </tr>
  );
}
