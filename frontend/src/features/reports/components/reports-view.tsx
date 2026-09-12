"use client";

import { useState } from "react";
import Link from "next/link";
import { FileBarChart2, Trophy } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/states";
import {
  ProviderTypeBreakdownTable,
  ProviderTypeBreakdownSkeleton,
} from "@/features/dashboard/components/provider-type-breakdown";
import { PROVIDER_TYPE_INFO } from "@/lib/domain/provider";
import { cn, formatNumber, formatPercent } from "@/lib/utils";
import { useReports } from "../hooks/use-reports";

const TOP_OPTIONS = [10, 20, 50, 100] as const;

/** เน้น 3 อันดับแรกด้วยขนาดและน้ำหนัก ไม่ใช้สีบอกอันดับ ให้ตรงกับการ์ดหน้าแรก */
const LEAD_COUNT = 3;

export function ReportsView() {
  const [limit, setLimit] = useState<number>(10);
  const { data, isPending, isFetching, isError, error, refetch } =
    useReports(limit);

  return (
    <div className="space-y-4">
      <PageHeader
        icon={FileBarChart2}
        title="รายงาน"
        description="สรุปผลการส่งเคลมสำหรับนำเสนอและติดตามภาพรวม"
      />

      <Card className="animate-rise overflow-hidden">
        <CardHeader
          title="หน่วยบริการที่ส่งสำเร็จมากที่สุด"
          description="เรียงตามจำนวนรายการที่ส่งสำเร็จ ไม่ใช่อัตราสำเร็จ เพราะรายที่ส่งน้อยแต่ผ่านหมดจะได้ 100% ซึ่งเทียบกันไม่ได้"
          action={
            <div
              className="flex items-center gap-1 rounded-[var(--radius)] border border-border p-0.5"
              role="group"
              aria-label="จำนวนอันดับที่แสดง"
            >
              {TOP_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLimit(option)}
                  aria-pressed={limit === option}
                  className={cn(
                    "cursor-pointer rounded-[calc(var(--radius)-2px)] px-2.5 py-1 text-sm font-medium transition-colors",
                    limit === option
                      ? "bg-primary text-on-primary"
                      : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          }
        />

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
          <div className="p-4">
            <TableSkeleton rows={10} columns={5} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className={cn(
                "w-full min-w-[46rem] border-collapse text-sm transition-opacity",
                isFetching && "opacity-60",
              )}
            >
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 text-center font-medium">อันดับ</th>
                  <th className="px-4 py-2.5 font-medium">หน่วยบริการ</th>
                  <th className="px-4 py-2.5 font-medium">ประเภท</th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    ส่งสำเร็จ
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    ส่งทั้งหมด
                  </th>
                  <th className="px-4 py-2.5 text-right font-medium">
                    อัตราสำเร็จ
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topProviders.map((row, index) => {
                  const isLead = index < LEAD_COUNT;

                  return (
                    <tr
                      key={row.newCode}
                      className="border-b border-border transition-colors last:border-0 hover:bg-surface-muted"
                    >
                      <td
                        className={cn(
                          "px-4 text-center tabular-nums",
                          isLead
                            ? "py-3 text-lg font-semibold text-foreground"
                            : "py-2.5 text-sm text-muted-foreground",
                        )}
                      >
                        {index + 1}
                      </td>
                      <td className={cn("px-4", isLead ? "py-3" : "py-2.5")}>
                        <Link
                          href={`/providers/${row.newCode}`}
                          className={cn(
                            "text-foreground transition-colors hover:text-primary hover:underline",
                            isLead ? "font-semibold" : "font-normal",
                          )}
                        >
                          {row.name}
                        </Link>
                        <span className="block text-xs text-muted-foreground">
                          {row.province} · เขต {row.healthZone} ·{" "}
                          {row.sourceSystem}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {PROVIDER_TYPE_INFO[row.type].shortLabel}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-2.5 text-right tabular-nums text-success",
                          isLead ? "text-base font-semibold" : "font-medium",
                        )}
                      >
                        {formatNumber(row.successCount)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                        {formatNumber(row.totalSent)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums">
                        {formatPercent(row.successRate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="animate-rise overflow-hidden">
        <CardHeader
          title="สรุปตามประเภทหน่วยบริการ"
          description="เทียบเฉพาะหน่วยที่ขนาดใกล้เคียงกัน คลินิกกับ รพ.ศูนย์ ต่างกันหลักร้อยเท่า"
        />
        {isPending || !data ? (
          <ProviderTypeBreakdownSkeleton />
        ) : (
          <ProviderTypeBreakdownTable rows={data.typeBreakdown} />
        )}
      </Card>

      <p className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <Trophy className="size-3.5 shrink-0" aria-hidden />
        อันดับนี้ดูจำนวนที่ส่งสำเร็จ หน่วยบริการขนาดใหญ่จึงมักอยู่อันดับต้น
        ถ้าต้องการดูว่าที่ไหนพัฒนาขึ้นมากที่สุด ให้ดูการ์ดในหน้าภาพรวม
      </p>
    </div>
  );
}
