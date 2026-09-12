"use client";

import { forwardRef, useState, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-[var(--radius)] font-medium transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-55 focus-visible:outline-2 focus-visible:outline-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary hover:bg-primary-hover shadow-sm",
        secondary:
          "bg-surface text-foreground border border-border-strong hover:bg-surface-muted",
        ghost: "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
        danger: "bg-danger text-white hover:brightness-110 shadow-sm",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-11 px-5 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: LucideIcon;
  loading?: boolean;
  /** ข้อความตอนกำลังทำงาน บอกผู้ใช้ว่าระบบทำอะไรอยู่ */
  loadingText?: string;
}

/**
 * กันกดซ้ำในตัว: ระหว่าง onClick ที่เป็น async ปุ่มจะ disable เอง
 * คืนสถานะใน finally เสมอ ต่อให้ onClick โยน error
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant,
      size,
      icon: Icon,
      loading,
      loadingText,
      children,
      onClick,
      disabled,
      ...props
    },
    ref,
  ) {
    const [busy, setBusy] = useState(false);
    const isBusy = loading || busy;

    async function handleClick(
      event: React.MouseEvent<HTMLButtonElement>,
    ): Promise<void> {
      if (isBusy || !onClick) return;
      const result = onClick(event) as unknown;
      if (result instanceof Promise) {
        setBusy(true);
        try {
          await result;
        } finally {
          setBusy(false);
        }
      }
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        onClick={handleClick}
        disabled={disabled || isBusy}
        aria-busy={isBusy}
        {...props}
      >
        {isBusy ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          Icon && <Icon className="size-4" aria-hidden />
        )}
        {isBusy && loadingText ? loadingText : children}
      </button>
    );
  },
);
