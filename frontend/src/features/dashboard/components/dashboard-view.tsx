"use client";

import { useState } from "react";
import { Building2, CheckCircle2, Send, XCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FreshnessIndicator } from "@/components/ui/freshness-indicator";
import { countDays, RANGE_PRESETS, type DateRange } from "@/lib/date-range";
import { ErrorState } from "@/components/shared/states";
import { ApiError } from "@/lib/api/client";
import { formatCompact, formatNumber, formatPercent } from "@/lib/utils";
import { useDashboard } from "../hooks/use-dashboard";
import { KpiCard, KpiCardSkeleton } from "./kpi-card";
import { IssueRankList, IssueRankSkeleton } from "./issue-rank-list";
import { TrendChart, TrendChartSkeleton } from "./trend-chart";
import {
  ProvidersNeedHelp,
  ProvidersNeedHelpSkeleton,
} from "./providers-need-help";
import {
  ProviderTypeBreakdownTable,
  ProviderTypeBreakdownSkeleton,
} from "./provider-type-breakdown";
import {
  SourceSystemBreakdownTable,
  SourceSystemBreakdownSkeleton,
} from "./source-system-breakdown";
import { MostImproved, MostImprovedSkeleton } from "./most-improved";

const DEFAULT_RANGE = RANGE_PRESETS.find((p) => p.id === "last7")!;

export function DashboardView() {
  const [range, setRange] = useState<DateRange>(() => DEFAULT_RANGE.resolve());
  const { data, isPending, isError, error, refetch, isFetching, dataUpdatedAt } =
    useDashboard(range);

  const dayCount = countDays(range);

  const errorMessage =
    error instanceof ApiError
      ? error.userMessage
      : "ระบบขัดข้องชั่วคราว กรุณากดลองใหม่อีกครั้ง";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DateRangePicker value={range} onChange={setRange} />

        {!isPending && !isError && (
          <FreshnessIndicator
            updatedAt={dataUpdatedAt}
            isFetching={isFetching}
            onRefresh={() => refetch()}
          />
        )}
      </div>

      {isError ? (
        <Card>
          <ErrorState message={errorMessage} onRetry={() => refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {isPending ? (
              Array.from({ length: 4 }).map((_, i) => (
                <KpiCardSkeleton key={i} />
              ))
            ) : (
              <>
                <KpiCard
                  label={
                    dayCount === 1
                      ? "ส่งเคลมในวันที่เลือก"
                      : `ส่งเคลมใน ${dayCount} วัน`
                  }
                  value={formatCompact(data.totalSent)}
                  unit="รายการ"
                  icon={Send}
                  hint={`จาก ${formatNumber(data.totalProviders)} หน่วยบริการ`}
                />
                <KpiCard
                  label="ส่งสำเร็จ"
                  value={formatPercent(data.successRate)}
                  icon={CheckCircle2}
                  tone="success"
                  deltaPct={data.successRateDeltaPct}
                  hint="เทียบวันก่อนหน้า"
                />
                <KpiCard
                  label="ส่งไม่สำเร็จ"
                  value={formatCompact(data.failedCount)}
                  unit="รายการ"
                  icon={XCircle}
                  tone="danger"
                  hint="ต้องแก้ไขและส่งใหม่"
                />
                <KpiCard
                  label="หน่วยบริการที่ติดปัญหา"
                  value={formatNumber(data.providersWithIssues)}
                  unit={`/ ${formatNumber(data.totalProviders)}`}
                  icon={Building2}
                  tone="warning"
                  hint={`เงียบผิดปกติ ${formatNumber(data.silentProviders)} แห่ง`}
                />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <Card className="flex flex-col xl:col-span-2">
              <CardHeader
                title="แนวโน้มการส่งเคลม"
                description="เปรียบเทียบรายการที่ส่งสำเร็จกับที่ส่งไม่สำเร็จในแต่ละวัน"
              />
              <div className="min-h-0 flex-1">
                {isPending ? (
                  <TrendChartSkeleton />
                ) : (
                  <TrendChart data={data.trend} />
                )}
              </div>
            </Card>

            <Card className="flex flex-col">
              <CardHeader
                title="ปัญหาที่พบมากที่สุด"
                description="เรียงตามจำนวนรายการที่ติดปัญหา"
              />
              <div className="flex min-h-0 flex-1 flex-col">
                {isPending ? (
                  <IssueRankSkeleton />
                ) : (
                  <IssueRankList ranks={data.topIssueGroups} />
                )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="สรุปตามประเภทหน่วยบริการ"
              description="แยกดูเพราะขนาดต่างกันมาก คลินิกที่พังทั้งหมดจะถูกกลบถ้าดูรวมกับ รพ. ใหญ่"
            />
            {isPending ? (
              <ProviderTypeBreakdownSkeleton />
            ) : (
              <ProviderTypeBreakdownTable rows={data.providerTypeBreakdown} />
            )}
          </Card>

          <Card>
            <CardHeader
              title="สรุปตามระบบต้นทาง"
              description="ถ้าระบบใดอัตราสำเร็จต่ำผิดปกติ ให้ทีมพัฒนาตรวจตัวระบบก่อน อาจไม่ใช่ความผิดของหน่วยบริการ"
            />
            {isPending ? (
              <SourceSystemBreakdownSkeleton />
            ) : (
              <SourceSystemBreakdownTable rows={data.sourceSystemBreakdown} />
            )}
          </Card>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
            <Card className="flex flex-col xl:col-span-2">
              <CardHeader
                title="หน่วยบริการที่ต้องช่วยด่วน"
                description="เรียงตามความเร่งด่วน คิดจากอัตราที่ส่งไม่สำเร็จควบคู่กับปริมาณที่กระทบ"
              />
              <div className="min-h-0 flex-1">
                {isPending ? (
                  <ProvidersNeedHelpSkeleton />
                ) : (
                  <ProvidersNeedHelp rows={data.providersNeedingHelp} />
                )}
              </div>
            </Card>

            <Card className="flex flex-col">
              <CardHeader
                title="ดีขึ้นมากที่สุด"
                description="เทียบกับช่วงก่อนหน้า"
              />
              <div className="flex min-h-0 flex-1 flex-col">
                {isPending ? (
                  <MostImprovedSkeleton />
                ) : (
                  <MostImproved rows={data.mostImproved} />
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
