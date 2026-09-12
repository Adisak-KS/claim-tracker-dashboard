"use client";

import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import type { IssueGroupRank } from "@/lib/domain/summary";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatNumber, formatSignedPercent } from "@/lib/utils";

/** ปัญหาที่พุ่งเร็วสำคัญกว่าปัญหาที่เยอะแต่นิ่ง จึงเน้นตัวที่โตเกิน 20% */
const SURGE_THRESHOLD = 20;

/** 3 อันดับแรกกินสัดส่วนเกินครึ่งเสมอ แยกน้ำหนักให้ตาจับได้ทันที */
const LEAD_COUNT = 3;

const VISIBLE_COUNT = 5;

export function IssueRankList({ ranks }: { ranks: IssueGroupRank[] }) {
  const top = ranks.slice(0, VISIBLE_COUNT);
  const max = top[0]?.count ?? 1;
  const remaining = ranks.length - top.length;

  return (
    <div className="flex h-full flex-col">
      <ol className="flex-1 divide-y divide-border">
        {top.map((rank, index) => {
          const isLead = index < LEAD_COUNT;
          const surging = rank.trendPct >= SURGE_THRESHOLD;

          return (
            <li key={rank.groupId}>
              <Link
                href={`/issues?group=${rank.groupId}`}
                className={cn(
                  "flex items-center gap-3 px-4 transition-colors hover:bg-surface-muted",
                  isLead ? "py-3" : "py-2.5",
                )}
              >
                <span
                  className={cn(
                    "shrink-0 text-center tabular-nums",
                    isLead
                      ? "w-5 text-lg font-semibold text-foreground"
                      : "w-5 text-sm text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        "truncate text-foreground",
                        isLead
                          ? "text-sm font-semibold"
                          : "text-sm font-normal",
                      )}
                    >
                      {rank.label}
                    </span>
                    {surging && (
                      <span className="shrink-0 rounded-full bg-danger-surface px-1.5 py-0.5 text-[0.625rem] font-semibold text-danger">
                        พุ่งขึ้น
                      </span>
                    )}
                  </span>

                  <span
                    className={cn(
                      "mt-1 block overflow-hidden rounded-full bg-surface-muted",
                      isLead ? "h-1.5" : "h-1",
                    )}
                  >
                    <span
                      className={cn(
                        "block h-full rounded-full bg-primary",
                        !isLead && "opacity-45",
                      )}
                      style={{ width: `${(rank.count / max) * 100}%` }}
                    />
                  </span>

                  <span className="mt-1 block truncate text-xs text-muted-foreground">
                    {formatNumber(rank.affectedProviders)} หน่วยบริการ
                    {rank.topCodes[0] && ` · ${rank.topCodes[0].label}`}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span
                    className={cn(
                      "block tabular-nums text-foreground",
                      isLead ? "text-base font-semibold" : "text-sm font-medium",
                    )}
                  >
                    {formatNumber(rank.count)}
                  </span>
                  <span
                    className={cn(
                      "flex items-center justify-end gap-0.5 text-xs font-medium",
                      rank.trendPct > 0 ? "text-danger" : "text-success",
                    )}
                  >
                    {rank.trendPct > 0 ? (
                      <TrendingUp className="size-3" aria-hidden />
                    ) : (
                      <TrendingDown className="size-3" aria-hidden />
                    )}
                    {formatSignedPercent(rank.trendPct, 0)}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>

      <Link
        href="/issues"
        className="mt-auto flex items-center justify-center gap-1.5 border-t border-border px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface-muted"
      >
        {remaining > 0
          ? `ดูปัญหาอีก ${formatNumber(remaining)} กลุ่มและวิธีแก้ไข`
          : "ดูปัญหาทั้งหมดและวิธีแก้ไข"}
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

export function IssueRankSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: VISIBLE_COUNT }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-5" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-1.5 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}
