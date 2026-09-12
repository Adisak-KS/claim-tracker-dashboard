"use client";

import type { LucideIcon } from "lucide-react";
import { Inbox, RefreshCw, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  /** บอกทางไปต่อเสมอ ห้ามปล่อยจอว่าง */
  hint: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  hint,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="rounded-full bg-surface-muted p-3">
        <Icon className="size-6 text-muted-foreground" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>
      </div>
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  /** ข้อความที่บอกผู้ใช้ว่าเกิดอะไรและต้องทำอะไร ไม่ใช่ stack trace */
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center"
      role="alert"
    >
      <div className="rounded-full bg-danger-surface p-3">
        <ServerCrash className="size-6 text-danger" aria-hidden />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          แสดงข้อมูลไม่สำเร็จ
        </p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={RefreshCw}
          onClick={onRetry}
        >
          ลองใหม่อีกครั้ง
        </Button>
      )}
    </div>
  );
}
