import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn("skeleton rounded-[var(--radius)]", className)}
      style={style}
      aria-hidden
    />
  );
}

/** โครงร่างตารางระหว่างโหลด ใช้จำนวนแถวเท่าของจริงกัน layout กระโดด */
export function TableSkeleton({
  rows = 8,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-2" role="status" aria-label="กำลังโหลดข้อมูล">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn("h-9 flex-1", colIndex === 0 && "flex-[2]")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
