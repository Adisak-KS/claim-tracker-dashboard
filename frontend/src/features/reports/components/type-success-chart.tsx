"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProviderTypeBreakdown } from "@/lib/domain/summary";
import { useChartColors } from "@/lib/chart-colors";
import { rateTone } from "@/lib/domain/rate-tone";
import { formatNumber, formatPercent } from "@/lib/utils";

/**
 * เทียบอัตราสำเร็จระหว่างประเภทหน่วยบริการ
 *
 * ใช้แท่งนอนเพราะชื่อประเภทเป็นภาษาไทยยาว ถ้าวางแนวตั้งจะเอียงจนอ่านไม่ออก
 * เรียงจากน้อยไปมากเพื่อให้ประเภทที่แย่ที่สุดอยู่บนสุด ซึ่งคือสิ่งที่ต้องแก้ก่อน
 *
 * 🔴 ตัดประเภทที่ส่งน้อยมากออก เพราะ 2 จาก 2 รายการได้ 100%
 * แล้วจะขึ้นไปอยู่อันดับต้นทั้งที่เทียบกับ รพ. ที่ส่งหลักพันไม่ได้
 */
const MIN_SENT_TO_COMPARE = 500;

interface ChartRow {
  label: string;
  successRate: number;
  sent: number;
  failed: number;
}

export function TypeSuccessChart({ rows }: { rows: ProviderTypeBreakdown[] }) {
  const colors = useChartColors();

  const data: ChartRow[] = rows
    .filter((r) => r.sent >= MIN_SENT_TO_COMPARE)
    .map((r) => ({
      label: r.label,
      successRate: r.successRate,
      sent: r.sent,
      failed: r.failed,
    }))
    .sort((a, b) => a.successRate - b.successRate);

  if (data.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        ยังไม่มีประเภทที่ส่งมากพอจะเทียบกันได้
      </p>
    );
  }

  const toneColor: Record<string, string> = {
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  };

  return (
    <div className="px-2 pb-2">
      <div style={{ height: data.length * 34 + 32 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 48, bottom: 4, left: 4 }}
            barCategoryGap={8}
          >
            <CartesianGrid
              horizontal={false}
              stroke={colors.border}
              strokeDasharray="3 3"
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v: number) => `${v}%`}
              tick={{ fill: colors.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={140}
              tick={{ fill: colors.muted, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: colors.border, fillOpacity: 0.3 }}
              contentStyle={{
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value, _name, item) => {
                const row = item?.payload as ChartRow | undefined;
                const detail = row
                  ? ` · ส่ง ${formatNumber(row.sent)} · ไม่สำเร็จ ${formatNumber(row.failed)}`
                  : "";
                return [
                  `${formatPercent(Number(value))}${detail}`,
                  "อัตราสำเร็จ",
                ];
              }}
            />
            <Bar dataKey="successRate" radius={[0, 4, 4, 0]} maxBarSize={20}>
              {data.map((row) => (
                <Cell
                  key={row.label}
                  fill={toneColor[rateTone(row.successRate)] ?? colors.primary}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* สีอย่างเดียวสื่อความไม่พอ ต้องมีข้อความกำกับเกณฑ์ให้คนตาบอดสีอ่านได้ */}
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 pt-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: colors.success }}
            aria-hidden
          />
          ตั้งแต่ 95% ขึ้นไป
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: colors.warning }}
            aria-hidden
          />
          80 ถึง 94%
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: colors.danger }}
            aria-hidden
          />
          ต่ำกว่า 80%
        </span>
        <span>
          แสดงเฉพาะประเภทที่ส่งตั้งแต่ {formatNumber(MIN_SENT_TO_COMPARE)}{" "}
          รายการขึ้นไป
        </span>
      </p>
    </div>
  );
}
