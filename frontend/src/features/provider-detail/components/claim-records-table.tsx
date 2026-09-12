"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { apiGet } from "@/lib/api/client";
import { AuthorityMessageInline } from "@/components/ui/authority-message";
import {
  ClaimRecordDialog,
  type ClaimRecordDetail,
} from "./claim-record-dialog";
import {
  Column,
  DataTable,
  DataTableHead,
  DataTableRow,
} from "@/components/ui/data-table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/ui/pagination";
import { SearchFilter } from "@/components/ui/filter-bar";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useStoredState } from "@/lib/use-stored-state";
import { getStatusLabel, type SchemeId } from "@/lib/domain/scheme";
import { CLAIM_OUTCOME_LABEL, type ClaimOutcome } from "@/lib/domain/claim";
import type { Paginated } from "@/lib/domain/summary";
import { cn, formatDateTimeTH, formatNumber } from "@/lib/utils";

const OUTCOME_TONE: Record<ClaimOutcome, StatusTone> = {
  success: "success",
  failed: "danger",
  pending: "warning",
  cancelled: "neutral",
};

const FILTERS = [
  { value: "failed", label: "ที่ต้องแก้" },
  { value: "success", label: "ที่สำเร็จ" },
  { value: "pending", label: "รอผล" },
  { value: "all", label: "ทั้งหมด" },
];

/**
 * รายการเคลมระดับ VN ของหน่วยบริการหนึ่ง
 *
 * แสดงตรงในหน้าเลย ไม่ซ่อนไว้หลังปุ่มรอบการส่ง
 * เพราะสิ่งที่เจ้าหน้าที่ต้องการคือ "VN ไหนติดอะไร" ไม่ใช่ "รอบไหนส่งกี่รายการ"
 * รอบการส่งเป็นแค่ข้อมูลประกอบ จึงย้ายไปอยู่บรรทัดรองใต้ VN
 */
export function ClaimRecordsTable({
  code,
  schemeId,
}: {
  code: string;
  schemeId: SchemeId;
}) {
  const [outcome, setOutcome] = useState("failed");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [openRecord, setOpenRecord] = useState<ClaimRecordDetail | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useStoredState(
    "claimRecords.pageSize",
    DEFAULT_PAGE_SIZE,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQ(q);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["provider-records", code, outcome, debouncedQ, page, pageSize],
    queryFn: () =>
      apiGet<Paginated<ClaimRecordDetail>>(
        `/api/providers/${code}/records`,
        { outcome, q: debouncedQ, page, pageSize },
      ),
    placeholderData: keepPreviousData,
  });

  function changeOutcome(next: string) {
    setOutcome(next);
    setPage(1);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3">
        <div
          className="flex flex-wrap gap-1"
          role="group"
          aria-label="กรองรายการ"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => changeOutcome(filter.value)}
              aria-pressed={outcome === filter.value}
              className={cn(
                "cursor-pointer rounded-[var(--radius)] px-2.5 py-1.5 text-sm font-medium transition-colors",
                outcome === filter.value
                  ? "bg-primary text-on-primary"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <SearchFilter
          label="ค้นหา"
          value={q}
          placeholder="VN หรือรหัสข้อผิดพลาด"
          onChange={setQ}
          className="w-56"
        />
      </div>

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
          <TableSkeleton rows={pageSize > 20 ? 20 : pageSize} columns={4} />
        </div>
      ) : data.rows.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="ไม่พบรายการในเงื่อนไขนี้"
          hint={
            outcome === "failed"
              ? "ไม่มีรายการที่ต้องแก้ในช่วงนี้ ลองเลือกดูรายการทั้งหมด"
              : "ลองเปลี่ยนตัวกรองหรือตรวจสอบคำค้นอีกครั้ง"
          }
        />
      ) : (
        <>
          <DataTable
            columns={4}
            className={cn(isFetching && "opacity-60 transition-opacity")}
          >
            <DataTableHead>
              <Column>VN</Column>
              <Column>เวลาที่ส่ง</Column>
              <Column align="center">ผลลัพธ์</Column>
              <Column>ข้อความที่ตอบกลับ</Column>
            </DataTableHead>
            <tbody>
              {data.rows.map((record) => (
                <DataTableRow
                  key={`${record.batchId}-${record.seq}`}
                  className="cursor-pointer"
                  onClick={() => setOpenRecord(record)}
                >
                  <td className="px-4 py-2.5">
                    <span className="block font-mono text-sm text-foreground">
                      {record.vn}
                    </span>
                    <span className="block font-mono text-xs text-muted-foreground">
                      {record.batchId}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {formatDateTimeTH(record.submittedAt)}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <StatusBadge
                      tone={OUTCOME_TONE[record.outcome]}
                      label={CLAIM_OUTCOME_LABEL[record.outcome]}
                    />
                  </td>
                  <td className="max-w-md px-4 py-2.5 whitespace-normal">
                    {record.responses?.length ? (
                      <span className="block space-y-1.5">
                        {record.responses.map((response) => (
                          <AuthorityMessageInline
                            key={response.code}
                            response={response}
                          />
                        ))}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {getStatusLabel(schemeId, record.statusCode)}
                      </span>
                    )}
                  </td>
                </DataTableRow>
              ))}
            </tbody>
          </DataTable>

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
        </>
      )}

      {openRecord && (
        <ClaimRecordDialog
          record={openRecord}
          schemeId={schemeId}
          onClose={() => setOpenRecord(null)}
        />
      )}
    </div>
  );
}

export function ClaimRecordsCount({ total }: { total: number }) {
  return <>{formatNumber(total)}</>;
}
