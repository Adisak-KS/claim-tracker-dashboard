"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "@/components/ui/select";
import { cn, formatNumber } from "@/lib/utils";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 10;

/** จำนวนเลขหน้ารอบ ๆ หน้าปัจจุบัน มากกว่านี้แถวปุ่มจะยาวเกินจอมือถือ */
const SIBLING_COUNT = 1;

const GAP = "gap" as const;

/**
 * สร้างรายการเลขหน้าแบบมีจุดไข่ปลา เช่น 1 ... 5 6 7 ... 502
 * เลขหน้าแรกกับหน้าสุดท้ายต้องเห็นเสมอ เพราะเป็นปลายทางที่คนกดบ่อยที่สุด
 */
export function buildPageItems(
  current: number,
  last: number,
): (number | typeof GAP)[] {
  const maxSlots = SIBLING_COUNT * 2 + 5;
  if (last <= maxSlots) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const left = Math.max(current - SIBLING_COUNT, 1);
  const right = Math.min(current + SIBLING_COUNT, last);
  const showLeftGap = left > 3;
  const showRightGap = right < last - 2;

  if (!showLeftGap && showRightGap) {
    const head = Array.from(
      { length: SIBLING_COUNT * 2 + 3 },
      (_, i) => i + 1,
    );
    return [...head, GAP, last];
  }

  if (showLeftGap && !showRightGap) {
    const tailLength = SIBLING_COUNT * 2 + 3;
    const tail = Array.from(
      { length: tailLength },
      (_, i) => last - tailLength + 1 + i,
    );
    return [1, GAP, ...tail];
  }

  const middle = Array.from(
    { length: right - left + 1 },
    (_, i) => left + i,
  );
  return [1, GAP, ...middle, GAP, last];
}

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
  const items = buildPageItems(page, lastPage);

  const arrowClass =
    "inline-flex h-8 cursor-pointer items-center gap-1 rounded-[var(--radius)] border border-border-strong bg-surface px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2";

  return (
    <nav
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3"
      aria-label="แบ่งหน้า"
    >
      <p className="text-sm text-muted-foreground">
        แสดง {formatNumber(first)} ถึง {formatNumber(last)} จากทั้งหมด{" "}
        {formatNumber(total)} รายการ
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          แสดงหน้าละ
          <Select
            value={String(pageSize)}
            options={PAGE_SIZE_OPTIONS.map((size) => ({
              value: String(size),
              label: String(size),
            }))}
            onChange={(next) => onPageSizeChange(Number(next))}
            ariaLabel="จำนวนแถวต่อหน้า"
            buttonClassName="h-8"
          />
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className={arrowClass}
            disabled={busy || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="size-4" aria-hidden />
            <span className="hidden sm:inline">ก่อนหน้า</span>
            <span className="sr-only sm:hidden">หน้าก่อนหน้า</span>
          </button>

          {items.map((item, index) =>
            item === GAP ? (
              <span
                key={`gap-${index}`}
                className="px-1 text-sm text-muted-foreground"
                aria-hidden
              >
                ...
              </span>
            ) : (
              <button
                key={item}
                type="button"
                disabled={busy}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`หน้า ${item}`}
                className={cn(
                  "h-8 min-w-8 cursor-pointer rounded-[var(--radius)] border px-2 text-sm tabular-nums transition-colors disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2",
                  item === page
                    ? "border-primary bg-primary font-semibold text-on-primary"
                    : "border-border-strong bg-surface text-foreground hover:bg-surface-muted",
                )}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            className={arrowClass}
            disabled={busy || page >= lastPage}
            onClick={() => onPageChange(page + 1)}
          >
            <span className="hidden sm:inline">ถัดไป</span>
            <span className="sr-only sm:hidden">หน้าถัดไป</span>
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </nav>
  );
}
