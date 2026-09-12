"use client";

import { TriangleAlert } from "lucide-react";
import type { SourceSystemBreakdown } from "@/lib/domain/summary";
import { Skeleton } from "@/components/ui/skeleton";
import { Column, DataTable, DataTableHead } from "@/components/ui/data-table";
import { rateBarClass, rateTextClass } from "@/lib/domain/rate-tone";
import { cn, formatCompact, formatNumber, formatPercent } from "@/lib/utils";

/**
 * ระบบต้นทางเป็นของทีมเราเอง ต่างจากมุมอื่นที่เป็นเรื่องของหน่วยบริการ
 * ถ้าระบบไหนต่ำกว่าค่าเฉลี่ยมาก แปลว่าน่าจะเป็นบั๊กของระบบนั้น
 * ต้องส่งทีม dev ไปดู ไม่ใช่ส่งทีมฝึกอบรมไปสอนหน่วยบริการ
 */
const ANOMALY_THRESHOLD = -5;

export function SourceSystemBreakdownTable({
  rows,
}: {
  rows: SourceSystemBreakdown[];
}) {
  const hasAnomaly = rows.some((r) => r.rateVsAverage <= ANOMALY_THRESHOLD);

  return (
    <div>
      {hasAnomaly && (
        <p className="flex items-start gap-2 border-b border-border bg-warning-surface px-4 py-2.5 text-xs text-warning">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            มีระบบที่อัตราสำเร็จต่ำกว่าค่าเฉลี่ยมาก
            ควรให้ทีมพัฒนาตรวจสอบตัวระบบก่อน เพราะอาจไม่ใช่ความผิดของหน่วยบริการ
          </span>
        </p>
      )}

      <DataTable columns={6}>
          <DataTableHead>
            <Column>ระบบต้นทาง</Column>
            <Column align="right">หน่วยบริการ</Column>
            <Column align="right">ส่งทั้งหมด</Column>
            <Column align="right">ไม่สำเร็จ</Column>
            <Column>อัตราสำเร็จ</Column>
            <Column align="right">เทียบค่าเฉลี่ย</Column>
          </DataTableHead>
          <tbody>
            {rows.map((row) => {
              const anomaly = row.rateVsAverage <= ANOMALY_THRESHOLD;

              return (
                <tr
                  key={row.system}
                  className={cn(
                    "border-b border-border last:border-0 hover:bg-surface-muted",
                    anomaly && "bg-warning-surface/40",
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    <span className="flex items-center gap-1.5">
                      {row.system}
                      {anomaly && (
                        <TriangleAlert
                          className="size-3.5 text-warning"
                          aria-label="ต่ำกว่าค่าเฉลี่ยมาก"
                        />
                      )}
                    </span>
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
                      <span className="h-1.5 w-20 shrink-0 overflow-hidden rounded-full bg-surface-muted">
                        <span
                          className={cn(
                            "block h-full rounded-full",
                            rateBarClass(row.successRate),
                          )}
                          style={{ width: `${row.successRate}%` }}
                        />
                      </span>
                      <span
                        className={cn(
                          "text-sm font-semibold tabular-nums",
                          rateTextClass(row.successRate),
                        )}
                      >
                        {formatPercent(row.successRate)}
                      </span>
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right text-sm font-medium tabular-nums",
                      row.rateVsAverage < 0 ? "text-danger" : "text-success",
                    )}
                  >
                    {row.rateVsAverage > 0 ? "+" : ""}
                    {row.rateVsAverage.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
      </DataTable>
    </div>
  );
}

export function SourceSystemBreakdownSkeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
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
