"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, ListTree, MessageSquareWarning } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import {
  Column,
  DataTable,
  DataTableHead,
  DataTableRow,
} from "@/components/ui/data-table";
import { getDefaultScheme } from "@/lib/domain/scheme";
import { BatchRecordsDialog } from "./batch-records-dialog";
import "@/lib/schemes";
import { PROVIDER_TYPE_INFO } from "@/lib/domain/provider";
import { CLAIM_OUTCOME_LABEL, type ClaimOutcome } from "@/lib/domain/claim";
import { rateTone } from "@/lib/domain/rate-tone";
import { ApiError } from "@/lib/api/client";
import {
  formatDateTimeTH,
  formatNumber,
  formatPercent,
  formatRelativeTH,
} from "@/lib/utils";
import { useProviderDetail } from "../hooks/use-provider-detail";

const OUTCOME_TONE: Record<ClaimOutcome, StatusTone> = {
  success: "success",
  failed: "danger",
  pending: "warning",
  cancelled: "neutral",
};

export function ProviderDetailView({ code }: { code: string }) {
  const { data, isPending, isError, error, refetch } = useProviderDetail(code);
  const [openBatch, setOpenBatch] = useState<string | null>(null);
  const schemeId = getDefaultScheme().id;

  if (isPending) return <ProviderDetailSkeleton />;

  if (isError) {
    const notFound = error instanceof ApiError && error.status === 404;

    return (
      <div className="space-y-4">
        <BackLink />
        <Card className="animate-rise">
          {notFound ? (
            <EmptyState
              icon={Building2}
              title="ไม่พบหน่วยบริการรหัสนี้"
              hint={`ระบบไม่พบหน่วยบริการรหัส ${code} ในทะเบียน กรุณาตรวจสอบรหัสอีกครั้ง หรือกลับไปค้นหาจากรายชื่อหน่วยบริการ`}
            />
          ) : (
            <ErrorState
              message={
                error instanceof Error
                  ? error.message
                  : "เรียกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
              }
              onRetry={() => refetch()}
            />
          )}
        </Card>
      </div>
    );
  }

  const { provider, batches } = data;

  return (
    <div className="space-y-4">
      <BackLink />

      <header className="animate-rise">
        <h1 className="text-lg font-semibold text-foreground">
          {provider.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {PROVIDER_TYPE_INFO[provider.type].label} · {provider.province} · เขต{" "}
          {provider.healthZone} · ส่งผ่าน {provider.sourceSystem}
        </p>
        <p className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted-foreground">
          <span>รหัสใหม่ {provider.newCode}</span>
          {provider.legacyCode && <span>รหัสเดิม {provider.legacyCode}</span>}
          {provider.shortCode && <span>รหัส 5 หลัก {provider.shortCode}</span>}
        </p>
      </header>

      <p className="animate-rise text-sm text-muted-foreground">
        ตัวเลขทั้งหมดเป็นยอดรวมย้อนหลัง 14 วัน
      </p>

      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="ส่งทั้งหมด" value={formatNumber(provider.totalSent)} />
        <StatCard
          label="สำเร็จ"
          value={formatNumber(provider.successCount)}
          className="text-success"
        />
        <StatCard
          label="ไม่สำเร็จ"
          value={formatNumber(provider.failedCount)}
          className="text-danger"
        />
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">อัตราสำเร็จ</p>
          <div className="mt-1.5">
            <StatusBadge
              tone={rateTone(provider.successRate)}
              label={formatPercent(provider.successRate)}
            />
          </div>
        </Card>
      </div>

      <Card className="animate-rise overflow-hidden">
        <CardHeader
          title="รอบการส่งล่าสุด"
          description={`${formatNumber(batches.length)} รอบ · กดที่รหัสรอบเพื่อดูรายการรายตัวและข้อความที่ตอบกลับ · ส่งครั้งล่าสุด ${formatRelativeTH(provider.lastSentAt)}`}
        />

        {batches.length === 0 ? (
          <EmptyState
            icon={MessageSquareWarning}
            title="ยังไม่มีรอบการส่งในช่วงนี้"
            hint="หน่วยบริการนี้ยังไม่ได้ส่งเคลมเข้ามาในช่วง 14 วันที่ผ่านมา"
          />
        ) : (
          <DataTable columns={6}>
            <DataTableHead>
              <Column>รอบการส่ง</Column>
              <Column>เวลาที่ส่ง</Column>
              <Column align="right">ทั้งหมด</Column>
              <Column align="right">สำเร็จ</Column>
              <Column align="right">ไม่สำเร็จ</Column>
              <Column align="center">ผลลัพธ์</Column>
            </DataTableHead>
            <tbody>
              {batches.map((batch) => (
                <DataTableRow key={batch.batchId}>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => setOpenBatch(batch.batchId)}
                      className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs text-primary transition-colors hover:underline"
                      aria-label={`ดูรายการในรอบ ${batch.batchId}`}
                    >
                      <ListTree className="size-3.5" aria-hidden />
                      {batch.batchId}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {formatDateTimeTH(batch.submittedAt)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {formatNumber(batch.total)}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums text-success">
                    {formatNumber(batch.success)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums text-danger">
                    {formatNumber(batch.failed)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <StatusBadge
                      tone={OUTCOME_TONE[batch.outcome]}
                      label={CLAIM_OUTCOME_LABEL[batch.outcome]}
                    />
                  </td>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>
        )}
      </Card>

      {openBatch && (
        <BatchRecordsDialog
          batchId={openBatch}
          schemeId={schemeId}
          onClose={() => setOpenBatch(null)}
        />
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/providers"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
    >
      <ArrowLeft className="size-4" aria-hidden />
      กลับไปรายชื่อหน่วยบริการ
    </Link>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold tabular-nums ${className ?? "text-foreground"}`}
      >
        {value}
      </p>
    </Card>
  );
}

function ProviderDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-5 w-44" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-80" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}
