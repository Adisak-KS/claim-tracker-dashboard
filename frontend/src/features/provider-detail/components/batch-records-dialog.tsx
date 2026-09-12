"use client";

import { useEffect, useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { X } from "lucide-react";
import { apiGet } from "@/lib/api/client";
import { AuthorityMessage } from "@/components/ui/authority-message";
import {
  Column,
  DataTable,
  DataTableHead,
  DataTableRow,
} from "@/components/ui/data-table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/ui/pagination";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/states";
import { getStatusLabel, type SchemeId } from "@/lib/domain/scheme";
import {
  CLAIM_OUTCOME_LABEL,
  type ClaimRecord,
  type ClaimOutcome,
  type SubmissionBatch,
} from "@/lib/domain/claim";
import type { Paginated } from "@/lib/domain/summary";
import { cn, formatNumber } from "@/lib/utils";

const OUTCOME_TONE: Record<ClaimOutcome, StatusTone> = {
  success: "success",
  failed: "danger",
  pending: "warning",
  cancelled: "neutral",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "failed", label: "เฉพาะที่ไม่สำเร็จ" },
  { value: "success", label: "เฉพาะที่สำเร็จ" },
  { value: "all", label: "ทั้งหมด" },
];

interface RecordsResponse extends Paginated<ClaimRecord> {
  batch: SubmissionBatch;
}

/**
 * รายการรายตัวใน 1 รอบการส่ง
 *
 * เปิดค้างที่ "เฉพาะที่ไม่สำเร็จ" เพราะคนเปิดดูคือคนที่กำลังตามแก้ปัญหา
 * แต่สลับไปดูที่สำเร็จได้ เพื่อยืนยันว่าส่งไปแล้วจริง
 */
export function BatchRecordsDialog({
  batchId,
  schemeId,
  onClose,
}: {
  batchId: string;
  schemeId: SchemeId;
  onClose: () => void;
}) {
  const [outcome, setOutcome] = useState("failed");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["batch-records", batchId, outcome, page, pageSize],
    queryFn: () =>
      apiGet<RecordsResponse>(`/api/submissions/${batchId}`, {
        outcome,
        page,
        pageSize,
      }),
    placeholderData: keepPreviousData,
  });

  function changeFilter(next: string) {
    setOutcome(next);
    setPage(1);
  }

  return (
    <div
      className="animate-fade fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground/25 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`รายการในรอบการส่ง ${batchId}`}
      onClick={onClose}
    >
      <div
        className="animate-pop my-8 w-full max-w-5xl rounded-[var(--radius)] border border-border bg-surface shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              รายการในรอบการส่ง{" "}
              <code className="font-mono text-xs">{batchId}</code>
            </p>
            {data && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                ส่ง {formatNumber(data.batch.total)} รายการ · สำเร็จ{" "}
                {formatNumber(data.batch.success)} · ไม่สำเร็จ{" "}
                {formatNumber(data.batch.failed)}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-[var(--radius)] text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div
          className="flex flex-wrap gap-1 border-b border-border px-4 py-2.5"
          role="group"
          aria-label="กรองรายการ"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => changeFilter(filter.value)}
              aria-pressed={outcome === filter.value}
              className={cn(
                "cursor-pointer rounded-[var(--radius)] px-2.5 py-1 text-sm font-medium transition-colors",
                outcome === filter.value
                  ? "bg-primary text-on-primary"
                  : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
              )}
            >
              {filter.label}
            </button>
          ))}
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
            <TableSkeleton rows={10} columns={4} />
          </div>
        ) : data.rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            ไม่มีรายการในเงื่อนไขนี้
          </p>
        ) : (
          <>
            <DataTable
              columns={4}
              className={cn(isFetching && "opacity-60 transition-opacity")}
            >
              <DataTableHead>
                <Column align="right">ลำดับ</Column>
                <Column>VN</Column>
                <Column align="center">ผลลัพธ์</Column>
                <Column>ข้อความที่ตอบกลับ</Column>
              </DataTableHead>
              <tbody>
                {data.rows.map((record) => (
                  <DataTableRow key={record.seq}>
                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
                      {record.seq}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">
                      {record.vn}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <StatusBadge
                        tone={OUTCOME_TONE[record.outcome]}
                        label={CLAIM_OUTCOME_LABEL[record.outcome]}
                      />
                    </td>
                    <td className="px-4 py-2.5 whitespace-normal">
                      {record.responses?.length ? (
                        <div className="space-y-2">
                          {record.responses.map((response) => (
                            <AuthorityMessage
                              key={response.code}
                              response={response}
                            />
                          ))}
                        </div>
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
      </div>
    </div>
  );
}
