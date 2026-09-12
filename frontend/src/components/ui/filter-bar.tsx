"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FilterOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export function SelectFilter({
  label,
  value,
  options,
  onChange,
}: SelectFilterProps) {
  return (
    <label className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer truncate rounded-[var(--radius)] border border-border-strong bg-surface px-2.5 text-sm text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface SearchFilterProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  className?: string;
}

export function SearchFilter({
  label,
  value,
  placeholder,
  onChange,
  className,
}: SearchFilterProps) {
  return (
    <label className={cn("flex flex-col gap-1", className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="relative flex items-center">
        <Search
          className="pointer-events-none absolute left-2.5 size-4 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-[var(--radius)] border border-border-strong bg-surface pl-8 pr-2.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
        />
      </span>
    </label>
  );
}

interface FilterBarProps {
  children: React.ReactNode;
  /** แสดงปุ่มล้างเมื่อมีตัวกรองทำงานอยู่ ผู้ใช้จะได้ไม่งงว่าทำไมข้อมูลน้อย */
  activeCount: number;
  onReset: () => void;
}

export function FilterBar({ children, activeCount, onReset }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-border px-4 py-3">
      {children}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" icon={X} onClick={onReset}>
          ล้างตัวกรอง {activeCount} รายการ
        </Button>
      )}
    </div>
  );
}
