import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
}: PageHeaderProps) {
  return (
    <header className="animate-rise flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-[var(--radius)] bg-primary/10 p-2 text-primary">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
