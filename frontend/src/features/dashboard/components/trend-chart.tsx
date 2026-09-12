"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useSyncExternalStore } from "react";
import type { TrendPoint } from "@/lib/domain/summary";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAxisNumber, formatNumber } from "@/lib/utils";

function formatAxisDate(value: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
  }).format(new Date(value));
}

const SERVER_COLORS = {
  success: "#15803d",
  danger: "#c2161d",
  border: "#dde5ee",
  muted: "#5b6b82",
  surface: "#ffffff",
};

let clientColors: typeof SERVER_COLORS | null = null;

function readClientColors() {
  if (clientColors) return clientColors;
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  clientColors = {
    success: read("--success", SERVER_COLORS.success),
    danger: read("--danger", SERVER_COLORS.danger),
    border: read("--border", SERVER_COLORS.border),
    muted: read("--muted-foreground", SERVER_COLORS.muted),
    surface: read("--surface", SERVER_COLORS.surface),
  };
  return clientColors;
}

/** อ่านค่าสีจริงจาก CSS variable เพราะ SVG ใน Recharts ใช้ var() ตรง ๆ ไม่ได้ */
function useThemeColors() {
  return useSyncExternalStore(
    () => () => {},
    readClientColors,
    () => SERVER_COLORS,
  );
}

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const colors = useThemeColors();

  return (
    <div className="h-full min-h-[17rem] w-full px-1 pb-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="fillSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.success} stopOpacity={0.28} />
              <stop offset="100%" stopColor={colors.success} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fillFailed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.danger} stopOpacity={0.28} />
              <stop offset="100%" stopColor={colors.danger} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.border}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatAxisDate}
            tick={{ fontSize: 12, fill: colors.muted }}
            axisLine={{ stroke: colors.border }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatAxisNumber}
            tick={{ fontSize: 12, fill: colors.muted }}
            axisLine={false}
            tickLine={false}
            width={64}
          />
          <Tooltip
            contentStyle={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              borderRadius: "var(--radius)",
              fontSize: "0.8125rem",
            }}
            labelFormatter={(value) => formatAxisDate(String(value))}
            formatter={(value, name) => [
              `${formatNumber(Number(value))} รายการ`,
              name === "success" ? "ส่งสำเร็จ" : "ส่งไม่สำเร็จ",
            ]}
          />
          <Area
            type="monotone"
            dataKey="success"
            stroke={colors.success}
            strokeWidth={2}
            fill="url(#fillSuccess)"
          />
          <Area
            type="monotone"
            dataKey="failed"
            stroke={colors.danger}
            strokeWidth={2}
            fill="url(#fillFailed)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendChartSkeleton() {
  return (
    <div className="flex h-full min-h-[17rem] items-end gap-2 p-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1"
          // สูงไม่เท่ากันให้ดูเหมือนกราฟจริง ไม่ใช่แท่งเรียงเท่ากัน
          style={{ height: `${35 + ((i * 37) % 55)}%` }}
        />
      ))}
    </div>
  );
}
