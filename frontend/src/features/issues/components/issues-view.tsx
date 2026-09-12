"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  CircleCheck,
  CircleSlash,
  TriangleAlert,
  Wrench,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import "@/lib/schemes";
import { getDefaultScheme, getIssue } from "@/lib/domain/scheme";
import type { IssueGroupRank } from "@/lib/domain/summary";
import { cn, formatNumber, formatSignedPercent } from "@/lib/utils";
import { useIssues } from "../hooks/use-issues";

/**
 * แยก "แก้แล้วส่งใหม่ได้" ออกจาก "จบแล้ว" ให้ชัด
 * เพราะรายการที่ส่งใหม่ไม่ได้คือเงินที่หายไปแล้ว ไม่ใช่งานที่รอแก้
 */
function ResubmitBadge({ value }: { value: boolean | null }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
        ไม่ระบุ
      </span>
    );
  }

  const Icon = value ? CircleCheck : CircleSlash;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        value
          ? "border-success-border bg-success-surface text-success"
          : "border-danger-border bg-danger-surface text-danger",
      )}
    >
      <Icon className="size-3" aria-hidden />
      {value ? "แก้แล้วส่งใหม่ได้" : "ส่งใหม่ไม่ได้"}
    </span>
  );
}

function IssueGroupRow({
  rank,
  maxCount,
  expanded,
  onToggle,
}: {
  rank: IssueGroupRank;
  maxCount: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const schemeId = getDefaultScheme().id;

  return (
    <li className="border-b border-border last:border-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted"
      >
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180",
          )}
          aria-hidden
        />

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {rank.label}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatNumber(rank.topCodes.length)} รหัส ·{" "}
              {formatNumber(rank.affectedProviders)} หน่วยบริการ
            </span>
          </span>

          <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-muted">
            <span
              className="block h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${(rank.count / maxCount) * 100}%` }}
            />
          </span>
        </span>

        <span className="shrink-0 text-right">
          <span className="block text-base font-semibold tabular-nums text-foreground">
            {formatNumber(rank.count)}
          </span>
          <span
            className={cn(
              "text-xs font-medium tabular-nums",
              rank.trendPct > 0 ? "text-danger" : "text-success",
            )}
          >
            {formatSignedPercent(rank.trendPct, 0)}
          </span>
        </span>
      </button>

      {expanded && (
        <ul className="animate-fade divide-y divide-border border-t border-border bg-surface-muted/40">
          {rank.topCodes.map((code) => {
            const detail = getIssue(schemeId, code.code);

            return (
              <li key={code.code} className="px-4 py-3 pl-11">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2">
                      <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                        {code.code}
                      </code>
                      <span className="text-sm font-medium text-foreground">
                        {code.label}
                      </span>
                      <ResubmitBadge value={detail?.resubmittable ?? null} />
                    </p>
                    {detail?.remedy && (
                      <p className="mt-1.5 flex items-start gap-1.5 text-sm text-muted-foreground">
                        <Wrench
                          className="mt-0.5 size-3.5 shrink-0"
                          aria-hidden
                        />
                        {detail.remedy}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                    {formatNumber(code.count)} รายการ
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export function IssuesView() {
  const params = useSearchParams();
  const { data, isPending, isError, error, refetch } = useIssues();
  /** null = ผู้ใช้ยังไม่ได้เลือกเอง ให้ระบบเปิดกลุ่มแรกให้ */
  const [picked, setPicked] = useState<string | null>(params.get("group"));

  const rows = data?.rows ?? [];

  /**
   * คำนวณตอน render ไม่ใช่ยัดใส่ state ผ่าน effect
   * เพราะค่านี้อนุมานจาก props ได้อยู่แล้ว ถ้าใส่ state จะ render ซ้อนอีกรอบ
   */
  const expanded = picked ?? rows[0]?.groupId ?? null;
  const maxCount = rows[0]?.count ?? 1;

  return (
    <div className="space-y-4">
      <PageHeader
        icon={TriangleAlert}
        title="ปัญหาที่พบ"
        description="จัดอันดับตามจำนวนรายการที่ติดปัญหา กดที่กลุ่มเพื่อดูรหัสย่อยและวิธีแก้"
      />

      <Card className="animate-rise overflow-hidden">
        {isError ? (
          <ErrorState
            message={
              error instanceof Error
                ? error.message
                : "เรียกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
            }
            onRetry={() => refetch()}
          />
        ) : isPending ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="size-4" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-1.5 w-full" />
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={CircleCheck}
            title="ไม่พบปัญหาในช่วงนี้"
            hint="ทุกหน่วยบริการส่งเคลมผ่านหมด ลองขยายช่วงวันที่เพื่อดูย้อนหลัง"
          />
        ) : (
          <ol className="divide-y divide-border">
            {rows.map((rank) => (
              <IssueGroupRow
                key={rank.groupId}
                rank={rank}
                maxCount={maxCount}
                expanded={expanded === rank.groupId}
                onToggle={() =>
                  setPicked(expanded === rank.groupId ? "" : rank.groupId)
                }
              />
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
