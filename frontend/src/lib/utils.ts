import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const numberFormatter = new Intl.NumberFormat("th-TH");

export function formatNumber(value: number): string {
  return numberFormatter.format(Math.round(value));
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

/**
 * ย่อเฉพาะหลักล้านขึ้นไป หลักแสนคนไทยอ่านเต็มได้สบายอยู่แล้ว
 * ไม่ใช้หน่วย "พัน" กับเลขหลักแสน เพราะคนไทยไม่พูดว่า "340 พัน"
 */
export function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} ล้าน`;
  return formatNumber(value);
}

/**
 * แกนกราฟมีที่จำกัด ย่อได้ถึงหลักแสนโดยใช้หน่วยไทยที่ถูกต้อง
 * ใช้เฉพาะแกนกราฟ ห้ามใช้กับตัวเลขที่ผู้ใช้ต้องเอาไปกระทบยอด
 */
export function formatAxisNumber(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions % 1 === 0 ? millions : millions.toFixed(1)} ล้าน`;
  }
  if (value >= 100_000) {
    const hundredThousands = value / 100_000;
    return `${hundredThousands % 1 === 0 ? hundredThousands : hundredThousands.toFixed(1)} แสน`;
  }
  return formatNumber(value);
}

export function formatSignedPercent(value: number, digits = 1): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatDateTimeTH(iso: string | null): string {
  if (!iso) return "ยังไม่เคยส่ง";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatRelativeTH(iso: string | null): string {
  if (!iso) return "ยังไม่เคยส่ง";
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "เมื่อสักครู่";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  return `${days} วันที่แล้ว`;
}

