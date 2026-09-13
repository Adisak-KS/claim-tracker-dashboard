"use client";

import { useSyncExternalStore } from "react";

/**
 * สีสำรองตอน render ฝั่ง server ซึ่งอ่าน CSS variable ไม่ได้
 * ต้องตรงกับค่าใน globals.css ถ้าแก้ที่นั่นต้องแก้ที่นี่ด้วย
 */
const SERVER_COLORS = {
  primary: "#2b62b3",
  success: "#15803d",
  danger: "#c2161d",
  warning: "#b45309",
  border: "#dde5ee",
  muted: "#5b6b82",
  surface: "#ffffff",
};

export type ChartColors = typeof SERVER_COLORS;

let clientColors: ChartColors | null = null;

function readClientColors(): ChartColors {
  if (clientColors) return clientColors;
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  clientColors = {
    primary: read("--primary", SERVER_COLORS.primary),
    success: read("--success", SERVER_COLORS.success),
    danger: read("--danger", SERVER_COLORS.danger),
    warning: read("--warning", SERVER_COLORS.warning),
    border: read("--border", SERVER_COLORS.border),
    muted: read("--muted-foreground", SERVER_COLORS.muted),
    surface: read("--surface", SERVER_COLORS.surface),
  };
  return clientColors;
}

/** อ่านสีจริงจาก CSS variable เพราะ SVG ใน Recharts ใช้ var() ตรง ๆ ไม่ได้ */
export function useChartColors(): ChartColors {
  return useSyncExternalStore(
    () => () => {},
    readClientColors,
    () => SERVER_COLORS,
  );
}
