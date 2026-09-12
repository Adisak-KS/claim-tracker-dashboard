"use client";

import { AlertTriangle } from "lucide-react";
import type { ProviderTypeBreakdown } from "@/lib/domain/summary";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatCompact, formatNumber, formatPercent } from "@/lib/utils";

/**
 * แยกตามประเภทหน่วยบริการ เพราะขนาดต่างกันหลักร้อยเท่า
 * ถ้าดูรวมกัน คลินิกที่พังทั้งหมดจะถูกกลบด้วย รพ.ศูนย์ที่ส่งเยอะกว่ามาก
 */
function rateTone(rate: number) {
  if (rate >= 95) return "text-success";
  if (rate >= 80) return "text-warning";
  return "text-danger";
}

function barTone(rate: number) {
  if (rate >= 95) return "bg-success";
  if (rate >= 80) return "bg-warning";
  return "bg-danger";
}

export function ProviderTypeBreakdownTable({
  rows,
}: {
  rows: ProviderTypeBreakdown[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[44rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">ประเภทหน่วยบริการ</th>
            <th className="px-4 py-2.5 text-right font-medium">จำนวนแห่ง</th>
            <th className="px-4 py-2.5 text-right font-medium">ส่งทั้งหมด</th>
            <th className="px-4 py-2.5 text-right font-medium">ไม่สำเร็จ</th>
            <th className="px-4 py-2.5 font-medium">อัตราสำเร็จ</th>
            <th className="px-4 py-2.5 text-right font-medium">ต้องช่วย</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.type}
              className="border-b border-border last:border-0 hover:bg-surface-muted"
            >
              <td className="px-4 py-2.5 font-medium text-foreground">
                {row.label}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                {formatNumber(row.providerCount)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {formatCompact(row.sent)}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums text-danger">
                {formatCompact(row.failed)}
              </td>
              <td className="px-4 py-2.5">
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-muted">
                    <span
                      className={cn(
                        "block h-full rounded-full",
                        barTone(row.successRate),
                      )}
                      style={{ width: `${row.successRate}%` }}
                    />
                  </span>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      rateTone(row.successRate),
                    )}
                  >
                    {formatPercent(row.successRate)}
                  </span>
                </span>
              </td>
              <td className="px-4 py-2.5 text-right">
                {row.strugglingCount > 0 ? (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-warning">
                    <AlertTriangle className="size-3.5" aria-hidden />
                    {formatNumber(row.strugglingCount)}
                  </span>
                ) : (
                  <span className="text-sm text-muted-foreground">0</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProviderTypeBreakdownSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-8 flex-[2]" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      ))}
    </div>
  );
}
