"use client";

import { Search, X } from "lucide-react";
import { Select, type SelectOption } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type FilterOption = SelectOption;

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
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select
        value={value}
        options={options}
        onChange={onChange}
        ariaLabel={label}
        className="min-w-32"
      />
    </div>
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
        <button
          type="button"
          onClick={onReset}
          title={`ล้างตัวกรอง ${activeCount} รายการ`}
          aria-label={`ล้างตัวกรอง ${activeCount} รายการ`}
          className="mb-0.5 grid size-9 cursor-pointer place-items-center rounded-[var(--radius)] text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
