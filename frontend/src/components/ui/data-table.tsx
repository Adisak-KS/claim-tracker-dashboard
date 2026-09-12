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
        className={cn("w-full border-collapse text-sm", className)}
        style={{ minWidth: `${minWidth}rem` }}
      >
        {children}
      </table>
    </div>
  );
}

/**
 * หัวตารางลอยค้างตอนเลื่อน
 * ต้องเว้น 3.5rem ให้พ้น Topbar ที่สูง h-14 ไม่งั้นจะมุดหายไปข้างใต้
 * ใส่พื้นหลังทึบเสมอ ไม่งั้นแถวข้อมูลจะวิ่งทะลุขึ้นมาซ้อน
 */
export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-14 z-10 bg-surface">
      <tr className="border-b border-border text-left text-xs text-muted-foreground">
        {children}
      </tr>
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
      className={cn(base, "p-0")}
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
