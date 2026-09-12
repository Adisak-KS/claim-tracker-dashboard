import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatSignedPercent } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "danger" | "warning";
  /** ค่าบวกคือดีขึ้น ยกเว้น invertTrend ที่บวกคือแย่ลง */
  deltaPct?: number;
  invertTrend?: boolean;
  hint?: string;
}

const TONE_ICON_CLASS = {
  default: "bg-info-surface text-info",
  success: "bg-success-surface text-success",
  danger: "bg-danger-surface text-danger",
  warning: "bg-warning-surface text-warning",
} as const;

export function KpiCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = "default",
  deltaPct,
  invertTrend = false,
  hint,
}: KpiCardProps) {
  const improving =
    deltaPct === undefined ? null : invertTrend ? deltaPct < 0 : deltaPct > 0;

  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-[var(--radius)]",
            TONE_ICON_CLASS[tone],
          )}
        >
          <Icon className="size-[1.125rem]" aria-hidden />
        </span>
      </div>

      <p className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-foreground xl:text-3xl">
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </p>

      <div className="mt-1.5 flex items-center gap-1.5 text-xs">
        {deltaPct !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-1 font-medium",
              improving ? "text-success" : "text-danger",
            )}
          >
            {improving ? (
              <TrendingUp className="size-3.5" aria-hidden />
            ) : (
              <TrendingDown className="size-3.5" aria-hidden />
            )}
            {formatSignedPercent(deltaPct)}
          </span>
        )}
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </div>
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="rounded-[var(--radius)] border border-border bg-surface p-4">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-9" />
      </div>
      <Skeleton className="mt-3 h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  );
}
