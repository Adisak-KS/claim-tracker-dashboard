"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Building2, SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import {
  DEFAULT_PAGE_SIZE,
  Pagination,
} from "@/components/ui/pagination";
import {
  FilterBar,
  SearchFilter,
  SelectFilter,
  type FilterOption,
} from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useStoredState } from "@/lib/use-stored-state";
import { PROVIDER_TYPES, PROVIDER_TYPE_INFO } from "@/lib/domain/provider";
import type { ProviderSummary } from "@/lib/domain/summary";
import "@/lib/schemes";
import { getIssueLabel, getDefaultScheme } from "@/lib/domain/scheme";
import { useProviders } from "../hooks/use-providers";
import { formatNumber, formatPercent, formatRelativeTH } from "@/lib/utils";

/** ต่ำกว่า 80 คือต้องเข้าไปช่วยจริง ระหว่าง 80 ถึง 95 คือเฝ้าระวัง */
function rateTone(rate: number) {
  if (rate >= 95) return "success" as const;
  if (rate >= 80) return "warning" as const;
  return "danger" as const;
}

const ZONE_OPTIONS: FilterOption[] = [
  { value: "all", label: "ทุกเขต" },
  ...Array.from({ length: 13 }, (_, i) => ({
    value: String(i + 1),
    label: `เขต ${i + 1}`,
  })),
];

const SYSTEM_OPTIONS: FilterOption[] = [
  { value: "all", label: "ทุกระบบ" },
  { value: "HOSxP", label: "HOSxP" },
  { value: "EHP", label: "EHP" },
  { value: "NHIP", label: "NHIP" },
  { value: "OTHER", label: "อื่น ๆ" },
];

const TYPE_OPTIONS: FilterOption[] = [
  { value: "all", label: "ทุกประเภท" },
  ...PROVIDER_TYPES.map((t) => ({
    value: t,
    label: PROVIDER_TYPE_INFO[t].shortLabel,
  })),
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: "all", label: "ทุกสถานะ" },
  { value: "problem", label: "ติดปัญหา" },
  { value: "silent", label: "เงียบเกิน 24 ชม." },
  { value: "healthy", label: "ปกติ" },
];

const SORT_OPTIONS: FilterOption[] = [
  { value: "urgency", label: "ความเร่งด่วน" },
  { value: "failedCount", label: "ไม่สำเร็จมากสุด" },
  { value: "totalSent", label: "ส่งมากสุด" },
  { value: "successRate", label: "อัตราสำเร็จต่ำสุด" },
  { value: "name", label: "ชื่อ ก-ฮ" },
];

export function ProvidersView() {
  const params = useSearchParams();
  const schemeId = getDefaultScheme().id;

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [zone, setZone] = useState("all");
  const [system, setSystem] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState(params.get("status") ?? "all");
  const [sort, setSort] = useState("urgency");
  const [page, setPage] = useState(1);

  /**
   * เปลี่ยนตัวกรองต้องกลับหน้าแรกเสมอ ไม่งั้นค้างอยู่หน้า 40 ที่ไม่มีข้อมูลแล้ว
   * ทำตอน set ไม่ใช่ใน effect เพราะ effect จะ render ซ้อนหนึ่งรอบโดยเปล่าประโยชน์
   */
  function changeFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }
  const [pageSize, setPageSize] = useStoredState(
    "providers.pageSize",
    DEFAULT_PAGE_SIZE,
  );

  /** หน่วงก่อนยิง กันยิง API ทุกตัวอักษรตอนผู้ใช้พิมพ์ */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const { data, isPending, isFetching, isError, error, refetch } = useProviders(
    { q: debouncedQ, zone, system, type, status, sort, page, pageSize },
  );

  const activeCount = useMemo(
    () =>
      [debouncedQ !== "", zone !== "all", system !== "all", type !== "all", status !== "all"].filter(
        Boolean,
      ).length,
    [debouncedQ, zone, system, type, status],
  );

  function resetFilters() {
    setQ("");
    setZone("all");
    setSystem("all");
    setType("all");
    setStatus("all");
  }

  const rows = data?.rows ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Building2}
        title="หน่วยบริการ"
        description="ค้นหาและติดตามสถานะการส่งเคลมรายหน่วยบริการ"
      />

      <Card className="animate-rise overflow-hidden">
        <FilterBar activeCount={activeCount} onReset={resetFilters}>
          <SearchFilter
            label="ค้นหา"
            value={q}
            placeholder="ชื่อหน่วยบริการ รหัส หรือจังหวัด"
            onChange={setQ}
            className="min-w-56 flex-1"
          />
          <SelectFilter label="เขตสุขภาพ" value={zone} options={ZONE_OPTIONS} onChange={changeFilter(setZone)} />
          <SelectFilter label="ประเภท" value={type} options={TYPE_OPTIONS} onChange={changeFilter(setType)} />
          <SelectFilter label="ระบบต้นทาง" value={system} options={SYSTEM_OPTIONS} onChange={changeFilter(setSystem)} />
          <SelectFilter label="สถานะ" value={status} options={STATUS_OPTIONS} onChange={changeFilter(setStatus)} />
          <SelectFilter label="เรียงตาม" value={sort} options={SORT_OPTIONS} onChange={changeFilter(setSort)} />
        </FilterBar>

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
            <TableSkeleton rows={pageSize > 20 ? 20 : pageSize} columns={7} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="ไม่พบหน่วยบริการที่ตรงกับที่ค้นหา"
            hint="ลองลดตัวกรองลง หรือตรวจสอบคำค้นอีกครั้ง เช่น พิมพ์ชื่อจังหวัดแทนชื่อหน่วยบริการ"
            action={activeCount > 0 ? { label: "ล้างตัวกรอง", onClick: resetFilters } : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[60rem] border-collapse text-sm">
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
              <tbody
                className={isFetching ? "opacity-60 transition-opacity" : "transition-opacity"}
              >
                {rows.map((row: ProviderSummary) => (
                  <tr
                    key={row.newCode}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface-muted"
                  >
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/providers/${row.newCode}`}
                        className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
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
                    <td className="px-4 py-2.5 text-muted-foreground">{row.sourceSystem}</td>
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
          </div>
        )}

        {data && data.total > 0 && (
          <Pagination
            page={page}
            pageSize={pageSize}
            total={data.total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            busy={isFetching}
          />
        )}
      </Card>
    </div>
  );
}
