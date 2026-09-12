"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import { toApiDate, type DateRange } from "@/lib/date-range";
import type { DashboardSummary } from "@/lib/domain/summary";

/**
 * ดึงใหม่ทุก 1 นาที ผู้ใช้จึงไม่ต้องกดรีเฟรชเอง
 * ถี่กว่านี้ไม่ไหว เพราะถ้าเปิดค้างกันหลายสิบคนจะกลายเป็นภาระของ backend
 */
const REFRESH_INTERVAL_MS = 60_000;

export function useDashboard(range: DateRange) {
  const from = toApiDate(range.from);
  const to = toApiDate(range.to);

  return useQuery({
    queryKey: ["dashboard", from, to],
    queryFn: () => apiGet<DashboardSummary>("/api/dashboard", { from, to }),
    refetchInterval: REFRESH_INTERVAL_MS,
    // แท็บที่ไม่ได้ถูกมองอยู่ไม่ต้องดึง (จอทีวีเปิดค้างทั้งวันจะได้ไม่ยิงทิ้ง)
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });
}
