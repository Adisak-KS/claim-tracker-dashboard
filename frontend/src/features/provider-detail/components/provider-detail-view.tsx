"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Building2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { getDefaultScheme } from "@/lib/domain/scheme";
import { RANGE_PRESETS, type DateRange } from "@/lib/date-range";
import {
  ClaimRecordsTable,
  type RecordsSummary,
} from "./claim-records-table";
import "@/lib/schemes";
import { PROVIDER_TYPE_INFO } from "@/lib/domain/provider";
import { rateTone } from "@/lib/domain/rate-tone";
import { ApiError } from "@/lib/api/client";
import { formatNumber, formatPercent, formatRelativeTH } from "@/lib/utils";
import { useProviderDetail } from "../hooks/use-provider-detail";

/** 30 วันเพราะเจ้าหน้าที่ตามแก้ย้อนหลังได้หลายสัปดาห์ ไม่ใช่ดูแค่ของวันนี้ */
const DEFAULT_RANGE = RANGE_PRESETS.find((p) => p.id === "last30")!;

export function ProviderDetailView({ code }: { code: string }) {
  const { data, isPending, isError, error, refetch } = useProviderDetail(code);
  const scheme = getDefaultScheme();
  const [range, setRange] = useState<DateRange>(() => DEFAULT_RANGE.resolve());
  /** ยอดมาจากตารางเพราะต้องเป็นช่วงวันที่เดียวกัน ไม่งั้นเลขบนกับล่างขัดกัน */
  const [summary, setSummary] = useState<RecordsSummary | undefined>();

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

  const { provider } = data;

  return (
    <div className="space-y-4">
      <BackLink />

      <header className="animate-rise">
        <h1 className="text-lg font-semibold text-foreground">
          {provider.name}
        </h1>
        {/* รหัสครบ 3 แบบเพราะหน่วยบริการอาจอ้างคนละรหัส แต่ยุบไว้บรรทัดเดียว */}
        <p className="mt-1 text-sm text-muted-foreground">
          {PROVIDER_TYPE_INFO[provider.type].shortLabel} · {provider.province} ·
          เขต {provider.healthZone} · {provider.sourceSystem} ·{" "}
          <span
            className="font-mono text-xs"
            title={`รหัส 9 หลักใหม่ ${provider.newCode}${
              provider.legacyCode ? ` · รหัส 9 หลักเดิม ${provider.legacyCode}` : ""
            }${provider.shortCode ? ` · รหัส 5 หลัก ${provider.shortCode}` : ""}`}
          >
            {[provider.newCode, provider.legacyCode, provider.shortCode]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </p>
      </header>

      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="ส่งทั้งหมด"
          value={summary ? formatNumber(summary.total) : "..."}
        />
        <StatCard
          label="สำเร็จ"
          value={summary ? formatNumber(summary.success) : "..."}
          className="text-success"
        />
        <StatCard
          label="ไม่สำเร็จ"
          value={summary ? formatNumber(summary.failed) : "..."}
          className="text-danger"
        />
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">อัตราสำเร็จ</p>
          <div className="mt-1.5">
            {summary && summary.total > 0 ? (
              <StatusBadge
                tone={rateTone((summary.success / summary.total) * 100)}
                label={formatPercent((summary.success / summary.total) * 100)}
              />
            ) : (
              <span className="text-sm text-muted-foreground">...</span>
            )}
          </div>
        </Card>
      </div>

      <Card className="animate-rise overflow-hidden">
        <CardHeader
          title="รายการเคลม"
          description={`ส่งครั้งล่าสุด ${formatRelativeTH(provider.lastSentAt)}`}
        />
        <ClaimRecordsTable
          code={code}
          schemeId={scheme.id}
          range={range}
          onRangeChange={setRange}
          onSummaryChange={setSummary}
        />
      </Card>
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
