import type { StatusTone } from "@/components/ui/status-badge";

/**
 * เกณฑ์ตัดสินว่าอัตราสำเร็จระดับไหนคือปกติ เฝ้าระวัง หรือต้องเข้าไปช่วย
 * อยู่ที่เดียวเพราะถ้าเจ้าของงานเปลี่ยนเกณฑ์ ต้องเปลี่ยนพร้อมกันทั้งระบบ
 * ไม่งั้นหน้าหนึ่งขึ้นเขียวอีกหน้าขึ้นเหลืองด้วยตัวเลขเดียวกัน
 */
const HEALTHY_THRESHOLD = 95;
const WATCH_THRESHOLD = 80;

export function rateTone(rate: number): StatusTone {
  if (rate >= HEALTHY_THRESHOLD) return "success";
  if (rate >= WATCH_THRESHOLD) return "warning";
  return "danger";
}

export function rateTextClass(rate: number): string {
  const tone = rateTone(rate);
  if (tone === "success") return "text-success";
  if (tone === "warning") return "text-warning";
  return "text-danger";
}

export function rateBarClass(rate: number): string {
  const tone = rateTone(rate);
  if (tone === "success") return "bg-success";
  if (tone === "warning") return "bg-warning";
  return "bg-danger";
}
