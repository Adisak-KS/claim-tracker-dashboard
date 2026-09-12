"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Send, SearchX } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/ui/pagination";
import {
  FilterBar,
  SearchFilter,
  SelectFilter,
  type FilterOption,
} from "@/components/ui/filter-bar";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import {
  Column,
  DataTable,
  DataTableHead,
  type SortState,
} from "@/components/ui/data-table";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useStoredState } from "@/lib/use-stored-state";
import { CLAIM_OUTCOME_LABEL, type ClaimOutcome } from "@/lib/domain/claim";
import "@/lib/schemes";
import { getDefaultScheme, getIssueLabel } from "@/lib/domain/scheme";
import { formatNumber, formatDateTimeTH } from "@/lib/utils";
import { useSubmissions } from "../hooks/use-submissions";

const OUTCOME_TONE: Record<ClaimOutcome, StatusTone> = {
  success: "success",
  failed: "danger",
  pending: "warning",
  cancelled: "neutral",
};

const OUTCOME_OPTIONS: FilterOption[] = [
  { value: "all", label: "ทุกผลลัพธ์" },
  { value: "success", label: CLAIM_OUTCOME_LABEL.success },
  { value: "failed", label: CLAIM_OUTCOME_LABEL.failed },
  { value: "pending", label: CLAIM_OUTCOME_LABEL.pending },
];

const SYSTEM_OPTIONS: FilterOption[] = [
  { value: "all", label: "ทุกระบบ" },
  { value: "HOSxP", label: "HOSxP" },
  { value: "EHP", label: "EHP" },
  { value: "NHIP", label: "NHIP" },
  { value: "OTHER", label: "อื่น ๆ" },
];

export function SubmissionsView() {
  const schemeId = getDefaultScheme().id;

  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [outcome, setOutcome] = useState("all");
  const [system, setSystem] = useState("all");
  const [sort, setSort] = useState<SortState>({
    key: "submittedAt",
    direction: "desc",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useStoredState(
    "submissions.pageSize",
    DEFAULT_PAGE_SIZE,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  /** เปลี่ยนตัวกรองต้องกลับหน้าแรก ทำตอน set ไม่ใช่ใน effect กัน render ซ้อน */
  function changeFilter<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  /** กดหัวเดิมซ้ำ = สลับทิศ กดหัวใหม่ = เริ่มจากมากไปน้อย */
  function toggleSort(key: string) {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
        : { key, direction: "desc" },
    );
    setPage(1);
  }

  const { data, isPending, isFetching, isError, error, refetch } =
    useSubmissions({
      q: debouncedQ,
      outcome,
      system,
      sort: sort.key,
      direction: sort.direction,
      page,
      pageSize,
    });

  const activeCount = useMemo(
    () =>
      [debouncedQ !== "", outcome !== "all", system !== "all"].filter(Boolean)
        .length,
    [debouncedQ, outcome, system],
  );

  function resetFilters() {
    setQ("");
    setOutcome("all");
    setSystem("all");
  }

  const rows = data?.rows ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        icon={Send}
        title="การส่งเคลม"
        description="รอบการส่งทั้งหมดย้อนหลัง 14 วัน หนึ่งแถวคือการกดส่งหนึ่งครั้ง"
      />

      <Card className="animate-rise overflow-hidden">
        <FilterBar activeCount={activeCount} onReset={resetFilters}>
          <SearchFilter
            label="ค้นหา"
            value={q}
            placeholder="ชื่อหน่วยบริการ รหัส หรือเลขที่รอบส่ง"
            onChange={setQ}
            className="min-w-56 flex-1"
          />
          <SelectFilter
            label="ผลลัพธ์"
            value={outcome}
            options={OUTCOME_OPTIONS}
            onChange={changeFilter(setOutcome)}
          />
          <SelectFilter
            label="ระบบต้นทาง"
            value={system}
            options={SYSTEM_OPTIONS}
            onChange={changeFilter(setSystem)}
          />
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
            title="ไม่พบรอบการส่งที่ตรงกับที่ค้นหา"
            hint="ลองลดตัวกรองลง หรือค้นด้วยชื่อหน่วยบริการแทนเลขที่รอบส่ง"
            action={
              activeCount > 0
                ? { label: "ล้างตัวกรอง", onClick: resetFilters }
                : undefined
            }
          />
        ) : (
          <DataTable columns={9}>
              <DataTableHead>
                <Column>รอบการส่ง</Column>
                <Column sortKey="providerName" sort={sort} onSort={toggleSort}>
                  หน่วยบริการ
                </Column>
                <Column>ระบบ</Column>
                <Column align="right" sortKey="total" sort={sort} onSort={toggleSort}>
                  ทั้งหมด
                </Column>
                <Column align="right" sortKey="success" sort={sort} onSort={toggleSort}>
                  สำเร็จ
                </Column>
                <Column align="right" sortKey="failed" sort={sort} onSort={toggleSort}>
                  ไม่สำเร็จ
                </Column>
                <Column align="center">ผลลัพธ์</Column>
                <Column>ปัญหาหลัก</Column>
                <Column sortKey="submittedAt" sort={sort} onSort={toggleSort}>
                  เวลาที่ส่ง
                </Column>
              </DataTableHead>
              <tbody className="transition-opacity">
                {rows.map((row) => (
                  <tr
                    key={row.batchId}
                    className="border-b border-border transition-colors last:border-0 hover:bg-surface-muted"
                  >
                    <td className="px-4 py-2.5">
                      <code className="font-mono text-xs text-muted-foreground">
                        {row.batchId}
                      </code>
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/providers/${row.providerCode}`}
                        className="font-medium text-foreground transition-colors hover:text-primary hover:underline"
                      >
                        {row.providerName}
                      </Link>
                      <span className="block text-xs text-muted-foreground">
                        {row.province}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {row.sourceSystem}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatNumber(row.total)}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-success">
                      {formatNumber(row.success)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums text-danger">
                      {formatNumber(row.failed)}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge
                        tone={OUTCOME_TONE[row.outcome]}
                        label={CLAIM_OUTCOME_LABEL[row.outcome]}
                      />
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {getIssueLabel(schemeId, row.topIssueCode)}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatDateTimeTH(row.submittedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
          </DataTable>
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
