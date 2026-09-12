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
 * 1. 🔴 top ต้องเป็น 0 ไม่ใช่ 14
 *    กล่องนอกมี overflow-x-auto ซึ่งทำให้มันกลายเป็น scroll container
 *    หัวตารางจึงเกาะกับกล่องนั้น ไม่ใช่เกาะกับจอ ถ้าใส่ top-14
 *    หัวตารางจะถูกดันลงมา 3.5rem แล้วเปิดช่องโหว่ให้แถวข้อมูลโผล่ขึ้นมาเห็น
 * 2. ตารางต้องเป็น border-separate ไม่ใช่ border-collapse
 *    ถ้า collapse เบราว์เซอร์จะไม่วาดพื้นหลังของเซลล์ที่ sticky ให้
 *    (border-separate ทำให้ต้องวาดเส้นคั่นด้วย box-shadow แทน border)
 * 3. sticky กับพื้นหลังต้องอยู่ที่ <th> ไม่ใช่ <thead>
 *    เบราว์เซอร์ไม่ทำ sticky ให้ <thead> ตรง ๆ มันเกาะที่เซลล์แต่ละตัว
 */
/**
 * พื้นหลังเข้มกว่าตัวตาราง ให้แยกหัวกับข้อมูลออกจากกันได้ทันที
 * ใช้ surface-muted ไม่ใช่สีเข้มจัด เพราะหัวตารางไม่ใช่พระเอกของจอ
 * ถ้าเข้มเกินตาจะไปจับหัวตารางแทนที่จะจับตัวเลข
 */
const STICKY_HEAD_CELL =
  "sticky top-0 z-20 bg-surface-muted shadow-[inset_0_-1px_0_var(--border-strong)]";

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead>
      <tr className="text-left text-xs font-semibold text-foreground">
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
          "flex w-full cursor-pointer items-center gap-1 px-4 py-2.5 transition-colors hover:bg-border/40 focus-visible:outline-2 focus-visible:-outline-offset-2",
          JUSTIFY_CLASS[align],
          active && "text-foreground",
        )}
      >
        {children}
        <Icon
          className={cn(
            "size-3.5 shrink-0",
            active ? "text-primary" : "text-muted-foreground",
          )}
          aria-hidden
        />
      </button>
    </th>
  );
}

/**
 * ช่องชื่อที่ยาวได้ไม่จำกัด เช่นชื่อหน่วยบริการ
 *
 * มี 2 กับดักที่ต้องแก้พร้อมกัน
 * 1. ใส่ max-width ที่ <td> ตรง ๆ ไม่ได้ผล เพราะตารางเป็น table-auto
 *    เบราว์เซอร์คำนวณความกว้างจากเนื้อหาแล้วมองข้าม max-width ของเซลล์
 *    จึงต้องครอบด้วย <div> แล้วคุมความกว้างที่ตัวนั้นแทน
 * 2. 🔴 ต้องสั่ง whitespace-normal ที่ <div> ข้างในด้วย ไม่ใช่แค่ที่ <td>
 *    เพราะ DataTableRow สั่ง [&>td]:whitespace-nowrap ครอบทุกเซลล์
 *    ซึ่ง specificity สูงกว่า class ธรรมดาบน <td> เลยชนะเสมอ
 *    ถ้าตัดบรรทัดไม่ได้ ข้อความจะล้นไปทับคอลัมน์ถัดไป
 */
export function NameCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={cn("px-4 py-2.5", className)}>
      <div className="w-full max-w-[22rem] min-w-0 whitespace-normal">
        {children}
      </div>
    </td>
  );
}

/**
 * บรรทัดชื่อ ตัดที่ 2 บรรทัดแล้วขึ้น ... ท้าย
 *
 * ชื่อหน่วยบริการบางแห่งยาวมาก เช่น
 * "ศูนย์บริการด้านการแพทย์และการสาธารณสุข โรงพยาบาลแพร่ สาขาสำนักงานสาธารณสุขจังหวัดแพร่"
 * ถ้าปล่อยเต็มจะดันความสูงแถวจนตารางดูไม่เป็นระเบียบ
 *
 * ใส่ title ให้เสมอ ผู้ใช้จะได้เอาเมาส์ชี้แล้วเห็นชื่อเต็ม
 * เพราะชื่อที่ถูกตัดอาจต่างกันแค่ท้ายชื่อ (เช่น สาขาคนละสาขา)
 *
 * ภาษาไทยไม่มีช่องว่างระหว่างคำ ต้องใช้ break-words ไม่ใช่ break-all
 * ไม่งั้นจะตัดกลางคำจนอ่านไม่รู้เรื่อง
 */
export function NameLine({
  children,
  title,
  className,
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      className={cn("line-clamp-2 break-words", className)}
    >
      {children}
    </span>
  );
}

/**
 * แถวข้อมูล ใช้แทน <tr> ธรรมดา
 *
 * ตารางเป็น border-separate เส้นคั่นจึงต้องวาดที่ <td> ไม่ใช่ที่ <tr>
 * เพราะ border ของ <tr> จะไม่ถูกวาดเมื่อ border-separate
 *
 * เซลล์ไม่ตัดบรรทัดเป็นค่าเริ่มต้น เพราะข้อความสั้น ๆ อย่าง "3 ชั่วโมงที่แล้ว"
 * ถ้าตัดบรรทัดจะอ่านยากและทำให้ความสูงแต่ละแถวไม่เท่ากัน
 * เซลล์ไหนที่ตั้งใจให้ตัดบรรทัดได้ (เช่นชื่อหน่วยบริการยาว ๆ) ให้ใส่ whitespace-normal เอง
 */
export function DataTableRow({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        // hover ใช้สีจาง ๆ ของ primary ไม่ใช่ surface-muted เพราะสีนั้นเป็นของหัวตารางแล้ว
        "transition-colors hover:bg-primary/5 [&>td]:whitespace-nowrap [&>td]:border-b [&>td]:border-border last:[&>td]:border-0",
        className,
      )}
    >
      {children}
    </tr>
  );
}
