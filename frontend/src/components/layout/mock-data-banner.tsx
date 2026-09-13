"use client";

import { FlaskConical, X } from "lucide-react";
import { useStoredState } from "@/lib/use-stored-state";

const DISMISS_KEY = "mock-data-banner-dismissed";

/**
 * ขึ้นเฉพาะโหมดไฟล์นิ่ง (GitHub Pages) ที่ข้อมูลถูกสร้างในเครื่องผู้ใช้
 * ของจริงต่อฐานข้อมูลแล้วตัวแปรนี้ไม่ถูกตั้ง แถบนี้จะหายไปเอง
 */
const IS_MOCK = process.env.NEXT_PUBLIC_STATIC_MOCK === "1";

export function MockDataBanner() {
  const [dismissed, setDismissed] = useStoredState(DISMISS_KEY, false);

  if (!IS_MOCK || dismissed) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-2.5 border-b border-warning-border bg-warning-surface px-4 py-2.5 text-warning"
    >
      <FlaskConical className="mt-px size-4 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1 text-xs leading-relaxed">
        <span className="font-semibold">ข้อมูลจำลอง</span> ตัวเลขทุกตัวบนหน้าจอนี้
        เป็นข้อมูลสมมติสำหรับดูหน้าตาระบบ ไม่ใช่ยอดส่งเคลมจริงของหน่วยบริการ
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="-m-1 shrink-0 cursor-pointer rounded p-1 hover:bg-warning-border/40"
        aria-label="ปิดแถบแจ้งเตือนข้อมูลจำลอง"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
