"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FreshnessIndicatorProps {
  /** เวลาที่ดึงข้อมูลสำเร็จครั้งล่าสุด (epoch ms) */
  updatedAt: number;
  isFetching: boolean;
  onRefresh: () => void;
}

/** ข้อมูลเก่าเกินเท่านี้ถือว่าน่าสงสัย ปกติระบบดึงเองทุก 1 นาที */
const STALE_AFTER_MS = 180_000;

function describeAge(ms: number): string {
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "อัปเดตเมื่อสักครู่";
  if (minutes < 60) return `อัปเดต ${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `อัปเดต ${hours} ชั่วโมงที่แล้ว`;
  return `อัปเดต ${Math.floor(hours / 24)} วันที่แล้ว`;
}

export function FreshnessIndicator({
  updatedAt,
  isFetching,
  onRefresh,
}: FreshnessIndicatorProps) {
  // ต้องเดินเวลาเองทุก 30 วิ ไม่งั้นข้อความค้างที่ "เมื่อสักครู่" ตลอด
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const age = Math.max(0, now - updatedAt);
  const isStale = age > STALE_AFTER_MS;

  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isFetching}
      aria-live="polite"
      title="กดเพื่อดึงข้อมูลใหม่ทันที"
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors",
        "hover:bg-surface-muted disabled:cursor-not-allowed",
        isStale ? "text-warning" : "text-muted-foreground",
      )}
    >
      <RefreshCw
        className={cn("size-3.5 shrink-0", isFetching && "animate-spin")}
        aria-hidden
      />
      {isFetching ? "กำลังอัปเดต" : describeAge(age)}
    </button>
  );
}
