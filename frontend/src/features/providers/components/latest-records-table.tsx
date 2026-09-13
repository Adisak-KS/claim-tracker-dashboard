"use client";

import { useState } from "react";
import Link from "next/link";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CircleSlash, SearchX } from "lucide-react";
import { apiGet } from "@/lib/api/client";
import { AuthorityMessageInline } from "@/components/ui/authority-message";
import {
  ClaimRecordDialog,
  type ClaimRecordDetail,
} from "@/features/provider-detail/components/claim-record-dialog";
import {
  Column,
  DataTable,
  DataTableHead,
  DataTableRow,
  NameCell,
  NameLine,
} from "@/components/ui/data-table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/ui/pagination";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { TableSkeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { useStoredState } from "@/lib/use-stored-state";
import { getStatusLabel, type SchemeId } from "@/lib/domain/scheme";
import { CLAIM_OUTCOME_LABEL, type ClaimOutcome } from "@/lib/domain/claim";
import type { Paginated } from "@/lib/domain/summary";
import { cn, formatDateTimeTH } from "@/lib/utils";

const OUTCOME_TONE: Record<ClaimOutcome, StatusTone> = {
  success: "success",
  failed: "danger",
  pending: "warning",
  cancelled: "neutral",
};

export interface LatestRecord extends ClaimRecordDetail {
  providerCode: string;
  providerName: string;
  province: string;
  healthZone: number;
  sourceSystem: string;
}

function ResubmitCell({ responses }: { responses?: LatestRecord["responses"] }) {
  if (!responses?.length) {
    return <span className="text-sm text-muted-foreground">ไม่ติดปัญหา</span>;
  }
  if (responses.some((r) => r.allowClaim === "N")) {
    return <StatusBadge tone="danger" label="ต้องอุทธรณ์" icon={CircleSlash} />;
  }
  if (responses.every((r) => r.allowClaim === "Y")) {
    return <StatusBadge tone="success" label="ส่งใหม่ได้" />;
  }
  return <span className="text-sm text-muted-foreground">ไม่ระบุ</span>;
}

/**
 * รายการเคลมล่าสุดข้ามทุกหน่วยบริการ เรียงตามเวลาที่ส่ง
 *
 * 🔴 คอลัมน์หน่วยบริการห้ามตัดออก เพราะ vn ซ้ำกันได้ระหว่างหน่วยบริการ
 * ถ้าเห็นแค่ vn จะไม่มีทางรู้ว่าแถวนั้นเป็นของใคร
 */
export function LatestRecordsTable({
  schemeId,
  q,
  zone,
  system,
  outcome,
}: {
  schemeId: SchemeId;
  q: string;
  zone: string;
  system: string;
  outcome: string;
}) {
  const [openRecord, setOpenRecord] = useState<LatestRecord | null>(null);
  const [page, setPage] = useState(1);

  /**
   * ตัวกรองเปลี่ยนต้องกลับหน้าแรก ไม่งั้นค้างอยู่หน้าที่ไม่มีข้อมูลแล้ว
   * คำนวณระหว่าง render ไม่ใช่ใน effect เพราะ effect จะ render ซ้อนอีกรอบ
   */
  const filterKey = `${q}|${zone}|${system}|${outcome}`;
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (filterKey !== lastFilterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }
  const [pageSize, setPageSize] = useStoredState(
    "latestRecords.pageSize",
    DEFAULT_PAGE_SIZE,
  );

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["latest-records", q, zone, system, outcome, page, pageSize],
    queryFn: () =>
      apiGet<Paginated<LatestRecord>>("/api/records", {
        q,
        zone,
        system,
        outcome,
        page,
        pageSize,
      }),
    placeholderData: keepPreviousData,
  });

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : "เรียกข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
        }
        onRetry={() => refetch()}
      />
    );
  }

  if (isPending) {
    return (
      <div className="p-4">
        <TableSkeleton rows={pageSize > 20 ? 20 : pageSize} columns={7} />
      </div>
    );
  }

  if (data.rows.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title="ไม่พบรายการในเงื่อนไขนี้"
        hint="ลองลดตัวกรองลง หรือเปลี่ยนคำค้นอีกครั้ง"
      />
    );
  }

  return (
    <>
      <DataTable
        columns={7}
        className={cn(isFetching && "opacity-60 transition-opacity")}
      >
        <DataTableHead>
          <Column>หน่วยบริการ</Column>
          <Column>ระบบ</Column>
          <Column>VN</Column>
          <Column align="center">ส่งเบิกใหม่</Column>
          <Column align="center">ผลลัพธ์</Column>
          <Column>ข้อความที่ตอบกลับ</Column>
          <Column>เวลาที่ส่ง</Column>
        </DataTableHead>
        <tbody>
          {data.rows.map((record) => (
            <DataTableRow
              key={`${record.batchId}-${record.seq}`}
              className="cursor-pointer"
              onClick={() => setOpenRecord(record)}
            >
              <NameCell>
                <Link
                  href={`/providers/${record.providerCode}`}
                  onClick={(e) => e.stopPropagation()}
                  className="font-medium text-foreground transition-colors hover:text-primary"
                >
                  {record.providerName}
                </Link>
                <NameLine
                  title={`${record.providerCode} · ${record.province} · เขต ${record.healthZone}`}
                >
                  {record.province} · เขต {record.healthZone}
                </NameLine>
              </NameCell>
              <td className="px-4 py-2.5 text-sm text-muted-foreground">
                {record.sourceSystem}
              </td>
              <td className="px-4 py-2.5 font-mono text-sm text-foreground">
                {record.vn}
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
                  <AuthorityMessageInline
                    response={record.responses[0]}
                    moreCount={record.responses.length - 1}
                  />
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {getStatusLabel(schemeId, record.statusCode)}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {formatDateTimeTH(record.submittedAt)}
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

      {openRecord && (
        <ClaimRecordDialog
          record={openRecord}
          schemeId={schemeId}
          onClose={() => setOpenRecord(null)}
        />
      )}
    </>
  );
}
