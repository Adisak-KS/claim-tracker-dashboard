"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CircleSlash, SearchX } from "lucide-react";
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
import { SearchFilter, SelectFilter } from "@/components/ui/filter-bar";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { RANGE_PRESETS, toApiDate, type DateRange } from "@/lib/date-range";
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

/** 30 วันเพราะเจ้าหน้าที่ตามแก้ย้อนหลังได้หลายสัปดาห์ ไม่ใช่ดูแค่ของวันนี้ */
const DEFAULT_RANGE = RANGE_PRESETS.find((p) => p.id === "last30")!;

/** ใช้ dropdown ให้ตรงกับตัวกรองผลลัพธ์ในหน้า /submissions และ /providers */
const OUTCOME_OPTIONS = [
  { value: "failed", label: "ที่ต้องแก้" },
  { value: "success", label: "ที่สำเร็จ" },
  { value: "pending", label: "รอผล" },
  { value: "all", label: "ทั้งหมด" },
];

/**
 * แยกเป็นคอลัมน์ของตัวเอง เพื่อให้กวาดตาหาแถวที่ต้องอุทธรณ์ได้ทันที
 * ถ้ามีหลายรหัสในรายการเดียว ให้ยึดตัวที่แย่ที่สุด เพราะรายการนั้นจะติดทั้งรายการ
 */
function ResubmitCell({
  responses,
}: {
  responses?: ClaimRecordDetail["responses"];
}) {
  if (!responses?.length) {
    return <span className="text-sm text-muted-foreground">ไม่ติดปัญหา</span>;
  }

  if (responses.some((r) => r.allowClaim === "N")) {
    return (
      <StatusBadge tone="danger" label="ต้องอุทธรณ์" icon={CircleSlash} />
    );
  }

  if (responses.every((r) => r.allowClaim === "Y")) {
    return <StatusBadge tone="success" label="ส่งใหม่ได้" />;
  }

  return <span className="text-sm text-muted-foreground">ไม่ระบุ</span>;
}

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
  const [range, setRange] = useState<DateRange>(() => DEFAULT_RANGE.resolve());
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

  const from = toApiDate(range.from);
  const to = toApiDate(range.to);

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: [
      "provider-records",
      code,
      from,
      to,
      outcome,
      debouncedQ,
      page,
      pageSize,
    ],
    queryFn: () =>
      apiGet<Paginated<ClaimRecordDetail>>(
        `/api/providers/${code}/records`,
        { from, to, outcome, q: debouncedQ, page, pageSize },
      ),
    placeholderData: keepPreviousData,
  });

  function changeOutcome(next: string) {
    setOutcome(next);
    setPage(1);
  }

  function changeRange(next: DateRange) {
    setRange(next);
    setPage(1);
  }

  return (
    <div>
      {/* เรียงแบบเดียวกับหน้า /providers คือค้นหาอยู่ซ้ายสุดและยืดเต็มที่เหลือ */}
      <div className="flex flex-wrap items-end gap-3 border-b border-border px-4 py-3">
        <SearchFilter
          label="ค้นหา"
          value={q}
          placeholder="VN หรือรหัสข้อผิดพลาด"
          onChange={setQ}
          className="min-w-56 flex-1"
        />

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">
            ช่วงวันที่
          </span>
          <DateRangePicker value={range} onChange={changeRange} />
        </div>

        <SelectFilter
          label="ผลลัพธ์"
          value={outcome}
          options={OUTCOME_OPTIONS}
          onChange={changeOutcome}
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
          <TableSkeleton rows={pageSize > 20 ? 20 : pageSize} columns={5} />
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
            columns={5}
            className={cn(isFetching && "opacity-60 transition-opacity")}
          >
            <DataTableHead>
              <Column>VN</Column>
              <Column>เวลาที่ส่ง</Column>
              <Column align="center">ส่งเบิกใหม่</Column>
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
                    <ResubmitCell responses={record.responses} />
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
