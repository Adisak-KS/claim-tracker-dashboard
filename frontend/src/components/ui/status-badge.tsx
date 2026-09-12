import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Info,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusTone = "success" | "danger" | "warning" | "info" | "neutral";

const TONE_CLASS: Record<StatusTone, string> = {
  success: "bg-success-surface text-success border-success-border",
  danger: "bg-danger-surface text-danger border-danger-border",
  warning: "bg-warning-surface text-warning border-warning-border",
  info: "bg-info-surface text-info border-info-border",
  neutral: "bg-neutral-surface text-neutral border-neutral-border",
};

const TONE_ICON: Record<StatusTone, LucideIcon> = {
  success: CheckCircle2,
  danger: XCircle,
  warning: AlertTriangle,
  info: Info,
  neutral: Clock,
};

interface StatusBadgeProps {
  tone: StatusTone;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

/** สีอย่างเดียวสื่อความไม่พอ ต้องมี icon กับข้อความกำกับเสมอ */
export function StatusBadge({
  tone,
  label,
  icon,
  className,
}: StatusBadgeProps) {
  const Icon = icon ?? TONE_ICON[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        TONE_CLASS[tone],
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {label}
    </span>
  );
}

export const CancelledIcon = Ban;
