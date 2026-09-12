"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROVIDER_TYPE_INFO } from "@/lib/domain/provider";
import type { ProviderSummary } from "@/lib/domain/summary";
import type { SchemeId } from "@/lib/domain/scheme";
import { getIssueLabel } from "@/lib/domain/scheme";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { formatNumber, formatPercent, formatRelativeTH } from "@/lib/utils";

/** ต่ำกว่า 80 คือต้องเข้าไปช่วยจริง ระหว่าง 80 ถึง 95 คือเฝ้าระวัง */
function rateTone(rate: number) {
  if (rate >= 95) return "success" as const;
  if (rate >= 80) return "warning" as const;
  return "danger" as const;
}

export function ProvidersNeedHelp({
  rows,
  schemeId,
}: {
  rows: ProviderSummary[];
  schemeId: SchemeId;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[58rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">หน่วยบริการ</th>
            <th className="px-4 py-2.5 font-medium">ประเภท</th>
            <th className="px-4 py-2.5 font-medium">ระบบ</th>
            <th className="px-4 py-2.5 text-right font-medium">ส่งทั้งหมด</th>
            <th className="px-4 py-2.5 text-right font-medium">ไม่สำเร็จ</th>
            <th className="px-4 py-2.5 text-center font-medium">อัตราสำเร็จ</th>
            <th className="px-4 py-2.5 font-medium">ปัญหาหลัก</th>
            <th className="px-4 py-2.5 font-medium">ส่งล่าสุด</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.newCode}
              className="border-b border-border transition-colors last:border-0 hover:bg-surface-muted"
            >
              <td className="px-4 py-2.5">
                <Link
                  href={`/providers/${row.newCode}`}
                  className="font-medium text-foreground hover:text-primary hover:underline"
                >
                  {row.name}
                </Link>
                <span className="block text-xs text-muted-foreground">
                  {row.shortCode ?? row.newCode} · {row.province} · เขต {row.healthZone}
                </span>
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {PROVIDER_TYPE_INFO[row.type].shortLabel}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {row.sourceSystem}
              </td>
              <td className="px-4 py-2.5 text-right tabular-nums">
                {formatNumber(row.totalSent)}
              </td>
              <td className="px-4 py-2.5 text-right font-medium tabular-nums text-danger">
                {formatNumber(row.failedCount)}
              </td>
              <td className="px-4 py-2.5 text-center">
                <StatusBadge
                  tone={rateTone(row.successRate)}
                  label={formatPercent(row.successRate)}
                />
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {getIssueLabel(schemeId, row.topIssueCode)}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {formatRelativeTH(row.lastSentAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link
        href="/providers?status=problem"
        className="flex items-center justify-center gap-1.5 border-t border-border px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-surface-muted"
      >
        ดูหน่วยบริการทั้งหมดที่ติดปัญหา
        <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

export function ProvidersNeedHelpSkeleton() {
  return (
    <div className="p-4">
      <TableSkeleton rows={8} columns={7} />
    </div>
  );
}
