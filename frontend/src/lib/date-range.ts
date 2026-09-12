/**
 * ระบบราชการไทยใช้ พ.ศ. ทั้งหมด แต่ JavaScript Date เก็บเป็น ค.ศ.
 * ไฟล์นี้เป็นที่เดียวที่แปลงสองอย่างนี้ ห้ามบวกลบ 543 กระจายที่อื่น
 */
export const BUDDHIST_YEAR_OFFSET = 543;

export interface DateRange {
  from: Date;
  to: Date;
}

export type RangePresetId =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export interface RangePreset {
  id: RangePresetId;
  label: string;
  resolve: () => DateRange;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function endOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export const RANGE_PRESETS: RangePreset[] = [
  {
    id: "today",
    label: "วันนี้",
    resolve: () => ({ from: startOfDay(new Date()), to: endOfDay(new Date()) }),
  },
  {
    id: "yesterday",
    label: "เมื่อวาน",
    resolve: () => {
      const y = addDays(new Date(), -1);
      return { from: startOfDay(y), to: endOfDay(y) };
    },
  },
  {
    id: "last7",
    label: "7 วันล่าสุด",
    resolve: () => ({
      from: startOfDay(addDays(new Date(), -6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    id: "last30",
    label: "30 วันล่าสุด",
    resolve: () => ({
      from: startOfDay(addDays(new Date(), -29)),
      to: endOfDay(new Date()),
    }),
  },
  {
    id: "thisMonth",
    label: "เดือนนี้",
    resolve: () => {
      const now = new Date();
      return {
        from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)),
        to: endOfDay(now),
      };
    },
  },
  {
    id: "lastMonth",
    label: "เดือนก่อน",
    resolve: () => {
      const now = new Date();
      return {
        from: startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1)),
        to: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)),
      };
    },
  },
];

export const THAI_MONTHS_FULL = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

export const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

/** อาทิตย์ขึ้นต้นสัปดาห์ตามปฏิทินไทย */
export const THAI_WEEKDAYS_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

export function toBuddhistYear(d: Date): number {
  return d.getFullYear() + BUDDHIST_YEAR_OFFSET;
}

/** 12 ก.ย. 2569 */
export function formatThaiDate(d: Date): string {
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]} ${toBuddhistYear(d)}`;
}

/** กันยายน 2569 */
export function formatThaiMonthYear(d: Date): string {
  return `${THAI_MONTHS_FULL[d.getMonth()]} ${toBuddhistYear(d)}`;
}

export function formatRangeLabel(range: DateRange): string {
  if (isSameDay(range.from, range.to)) return formatThaiDate(range.from);
  return `${formatThaiDate(range.from)} ถึง ${formatThaiDate(range.to)}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function countDays(range: DateRange): number {
  const ms = startOfDay(range.to).getTime() - startOfDay(range.from).getTime();
  return Math.floor(ms / 86_400_000) + 1;
}

/** API รับเป็น YYYY-MM-DD แบบเวลาท้องถิ่น ห้ามใช้ toISOString เพราะจะเลื่อนเป็น UTC */
export function toApiDate(d: Date): string {
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export function matchPreset(range: DateRange): RangePresetId {
  for (const preset of RANGE_PRESETS) {
    const candidate = preset.resolve();
    if (
      isSameDay(candidate.from, range.from) &&
      isSameDay(candidate.to, range.to)
    ) {
      return preset.id;
    }
  }
  return "custom";
}

/** ตารางวันของเดือนนั้น เติมช่องว่างหัวท้ายให้ครบสัปดาห์ */
export function buildMonthGrid(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let i = 0; i < first.getDay(); i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}
