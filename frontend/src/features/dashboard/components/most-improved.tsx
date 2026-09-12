"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { PROVIDER_TYPE_INFO } from "@/lib/domain/provider";
import type { ProviderMovement } from "@/lib/domain/summary";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/states";
import { formatNumber, formatPercent } from "@/lib/utils";

/**
 * รูปแบบ dumbbell ตามที่ dataviz กำหนดไว้สำหรับข้อมูล "ก่อน เทียบ หลัง"
 * จุดจางคือช่วงก่อนหน้า จุดทึบคือช่วงนี้ เส้นเชื่อมยาวเท่ากับที่ดีขึ้น
 *
 * ไม่ใช้ "อันดับส่งสำเร็จมากสุด" เพราะ รพ.ศูนย์จะชนะตลอดด้วยขนาด
 * ไม่ใช่ด้วยผลงาน และอันดับจะนิ่งจนไม่มีใครกลับมาดูซ้ำ
 */
const SCALE_MIN = 30;

function toPercentPosition(rate: number): number {
  const clamped = Math.max(SCALE_MIN, Math.min(100, rate));
  return ((clamped - SCALE_MIN) / (100 - SCALE_MIN)) * 100;
}

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
    <div className="flex h-full flex-col">
      <ol className="flex-1 divide-y divide-border">
        {rows.map((row, index) => {
          const start = toPercentPosition(row.previousRate);
          const end = toPercentPosition(row.currentRate);
          const left = Math.min(start, end);
          const width = Math.abs(end - start);

          return (
            <li key={row.code}>
              <Link
                href={`/providers/${row.code}`}
                className="block px-4 py-3 transition-colors hover:bg-surface-muted"
              >
                <div className="flex items-start gap-3">
                  <span
                    className="w-5 shrink-0 text-center text-sm tabular-nums text-muted-foreground"
                    aria-hidden
                  >
                    {index + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {row.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {PROVIDER_TYPE_INFO[row.type].shortLabel} · {row.province}{" "}
                      · {row.sourceSystem} · ส่ง {formatNumber(row.sent)} รายการ
                    </p>
                  </div>

                  <span className="shrink-0 text-right">
                    <span className="flex items-center justify-end gap-1 text-sm font-semibold text-success">
                      <TrendingUp className="size-3.5" aria-hidden />+
                      {row.deltaPoints.toFixed(1)}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      จุด
                    </span>
                  </span>
                </div>

                <div
                  className="relative mt-2 ml-8 h-5"
                  role="img"
                  aria-label={`จาก ${formatPercent(row.previousRate)} เป็น ${formatPercent(row.currentRate)}`}
                >
                  <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />

                  <span
                    className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-success"
                    style={{ left: `${left}%`, width: `${width}%` }}
                  />

                  <span
                    className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-muted-foreground"
                    style={{ left: `${start}%` }}
                    title={`ก่อนหน้า ${formatPercent(row.previousRate)}`}
                  />
                  <span
                    className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-success"
                    style={{ left: `${end}%` }}
                    title={`ปัจจุบัน ${formatPercent(row.currentRate)}`}
                  />
                </div>

                <p className="mt-1 ml-8 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{formatPercent(row.previousRate)}</span>
                  <ArrowRight className="size-3" aria-hidden />
                  <span className="font-medium text-success">
                    {formatPercent(row.currentRate)}
                  </span>
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function MostImprovedSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2 px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-5" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-8 w-14" />
          </div>
          <Skeleton className="ml-8 h-1 w-[calc(100%-2rem)]" />
        </div>
      ))}
    </div>
  );
}
