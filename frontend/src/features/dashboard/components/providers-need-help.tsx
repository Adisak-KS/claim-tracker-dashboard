"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROVIDER_TYPE_INFO } from "@/lib/domain/provider";
import type { ProviderSummary } from "@/lib/domain/summary";
import "@/lib/schemes";
import { getIssueLabel, type SchemeId } from "@/lib/domain/scheme";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Column,
  DataTable,
  DataTableHead,
  DataTableRow,
} from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { rateTone } from "@/lib/domain/rate-tone";
import { formatNumber, formatPercent, formatRelativeTH } from "@/lib/utils";

export function ProvidersNeedHelp({
  rows,
  schemeId,
}: {
  rows: ProviderSummary[];
  schemeId: SchemeId;
}) {
  return (
    <div>
      <DataTable columns={8}>
        <DataTableHead>
          <Column>หน่วยบริการ</Column>
          <Column>ประเภท</Column>
          <Column>ระบบ</Column>
          <Column align="right">ส่งทั้งหมด</Column>
          <Column align="right">ไม่สำเร็จ</Column>
          <Column align="center">อัตราสำเร็จ</Column>
          <Column>ปัญหาหลัก</Column>
          <Column>ส่งล่าสุด</Column>
        </DataTableHead>
        <tbody>
          {rows.map((row) => (
            <DataTableRow key={row.newCode}>
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
            </DataTableRow>
          ))}
        </tbody>
      </DataTable>

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
