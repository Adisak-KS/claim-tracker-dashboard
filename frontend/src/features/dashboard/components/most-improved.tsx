"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { PROVIDER_TYPE_INFO } from "@/lib/domain/provider";
import type { ProviderMovement } from "@/lib/domain/summary";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/states";
import { cn, formatPercent } from "@/lib/utils";

/**
 * ผู้บริหารเปิดดู 5 วินาที ตัวเลขสองตัวกับลูกศรอ่านเร็วกว่ากราฟที่ต้องตีความ
 * เคยทำเป็น dumbbell ตามตำราแล้วพบว่าคนอ่านไม่ออกว่าเส้นวัดอะไร จึงตัดทิ้ง
 */

/** เน้น 3 อันดับแรกด้วยขนาดและน้ำหนัก ไม่ใช้สีบอกอันดับ ให้ตรงกับการ์ดปัญหา */
const LEAD_COUNT = 3;

export function MostImproved({ rows }: { rows: ProviderMovement[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={TrendingUp}
        title="ยังไม่มีหน่วยบริการที่ดีขึ้นในช่วงนี้"
        hint="ลองขยายช่วงวันที่ให้กว้างขึ้น เพื่อดูการเปลี่ยนแปลงที่ชัดเจนกว่านี้"
      />
    );
  }

  return (
    <ol className="flex h-full flex-col divide-y divide-border">
      {rows.map((row, index) => {
        const isLead = index < LEAD_COUNT;

        return (
          <li key={row.newCode}>
            <Link
              href={`/providers/${row.newCode}`}
              className={cn(
                "flex items-center gap-3 px-4 transition-colors hover:bg-surface-muted",
                isLead ? "py-3" : "py-2.5",
              )}
            >
              <span
                className={cn(
                  "w-5 shrink-0 text-center tabular-nums",
                  isLead
                    ? "text-lg font-semibold text-foreground"
                    : "text-sm text-muted-foreground",
                )}
                aria-hidden
              >
                {index + 1}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-foreground",
                    isLead ? "text-sm font-semibold" : "text-sm font-normal",
                  )}
                >
                  {row.name}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {PROVIDER_TYPE_INFO[row.type].shortLabel} · {row.province} ·{" "}
                  {row.sourceSystem}
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span
                  className={cn(
                    "flex items-center justify-end gap-1.5 tabular-nums",
                    isLead ? "text-base" : "text-sm",
                  )}
                >
                  <span className="text-muted-foreground">
                    {formatPercent(row.previousRate, 0)}
                  </span>
                  <ArrowRight
                    className="size-3 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="font-semibold text-success">
                    {formatPercent(row.currentRate, 0)}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center justify-end gap-1 text-xs font-medium text-success">
                  <TrendingUp className="size-3" aria-hidden />
                  ดีขึ้น {Math.round(row.deltaPoints)}%
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export function MostImprovedSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-5" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
