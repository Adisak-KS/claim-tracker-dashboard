"use client";

import { AlertTriangle } from "lucide-react";
import type { ProviderTypeBreakdown } from "@/lib/domain/summary";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Column,
  DataTable,
  DataTableHead,
  DataTableRow,
} from "@/components/ui/data-table";
import { rateBarClass, rateTextClass } from "@/lib/domain/rate-tone";
import { cn, formatCompact, formatNumber, formatPercent } from "@/lib/utils";

/**
 * แยกตามประเภทหน่วยบริการ เพราะขนาดต่างกันหลักร้อยเท่า
 * ถ้าดูรวมกัน คลินิกที่พังทั้งหมดจะถูกกลบด้วย รพ.ศูนย์ที่ส่งเยอะกว่ามาก
 */

export function ProviderTypeBreakdownTable({
  rows,
}: {
  rows: ProviderTypeBreakdown[];
}) {
  return (
    <DataTable columns={6}>
        <DataTableHead>
          <Column>ประเภทหน่วยบริการ</Column>
          <Column align="right">จำนวนแห่ง</Column>
          <Column align="right">ส่งทั้งหมด</Column>
          <Column align="right">ไม่สำเร็จ</Column>
          <Column>อัตราสำเร็จ</Column>
          <Column align="right">ต้องช่วย</Column>
        </DataTableHead>
        <tbody>
          {rows.map((row) => (
            <DataTableRow key={row.type}>
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
            </DataTableRow>
          ))}
        </tbody>
    </DataTable>
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
