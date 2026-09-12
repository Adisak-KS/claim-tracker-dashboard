"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/utils";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** ปิดปุ่มระหว่างโหลด กันกดรัวจนข้ามหน้า */
  busy?: boolean;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  busy,
}: PaginationProps) {
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
      <p className="text-sm text-muted-foreground">
        แสดง {formatNumber(first)} ถึง {formatNumber(last)} จากทั้งหมด{" "}
        {formatNumber(total)} รายการ
      </p>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          แสดงหน้าละ
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 cursor-pointer rounded-[var(--radius)] border border-border-strong bg-surface px-2 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            size="sm"
            icon={ChevronLeft}
            disabled={busy || page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="หน้าก่อนหน้า"
          >
            ก่อนหน้า
          </Button>
          <span className="px-2 text-sm tabular-nums text-muted-foreground">
            {formatNumber(page)} / {formatNumber(lastPage)}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={busy || page >= lastPage}
            onClick={() => onPageChange(page + 1)}
            aria-label="หน้าถัดไป"
          >
            ถัดไป
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
