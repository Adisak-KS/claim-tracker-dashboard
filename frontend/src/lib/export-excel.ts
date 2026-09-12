import ExcelJS from "exceljs";
import { BUDDHIST_YEAR_OFFSET } from "@/lib/date-range";

/**
 * ออกไฟล์ Excel ให้ผู้บริหารเอาไปใช้ต่อได้ทันที
 *
 * ทำฝั่งเบราว์เซอร์ไม่ใช่ฝั่ง server เพราะข้อมูลที่ export คือสิ่งที่ผู้ใช้เห็นอยู่แล้ว
 * ไม่ต้องยิงกลับไปถามใหม่ และไม่ต้องแบก memory ฝั่ง server ตอนคนกดพร้อมกันหลายคน
 */

const HEADER_FILL = "FF2B62B3";
const HEADER_TEXT = "FFFFFFFF";
const STRIPE_FILL = "FFF4F7FB";
const BORDER_COLOR = "FFD8DEE8";

export type ColumnFormat = "text" | "number" | "percent" | "datetime";

export interface ExportColumn<T> {
  header: string;
  /** ความกว้างคอลัมน์ นับเป็นจำนวนตัวอักษร */
  width: number;
  format?: ColumnFormat;
  value: (row: T) => string | number | Date | null;
}

export interface ExportOptions<T> {
  /** ใช้เป็นชื่อไฟล์และหัวเรื่องบนแผ่นงาน */
  title: string;
  /** บอกว่ากรองอะไรอยู่ ผู้รับไฟล์จะได้รู้ว่าตัวเลขนี้มาจากเงื่อนไขไหน */
  subtitle?: string;
  columns: ExportColumn<T>[];
  rows: T[];
}

/** ชื่อไฟล์ต้องมีวันที่แบบ พ.ศ. เพราะผู้ใช้เป็นหน่วยงานราชการไทย */
function buildFileName(title: string): string {
  const now = new Date();
  const year = now.getFullYear() + BUDDHIST_YEAR_OFFSET;
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${title}-${year}${month}${day}.xlsx`;
}

function formatFor(format: ColumnFormat | undefined): string | undefined {
  if (format === "number") return "#,##0";
  if (format === "percent") return "0.0";
  if (format === "datetime") return "dd/mm/yyyy hh:mm";
  return undefined;
}

export async function exportToExcel<T>({
  title,
  subtitle,
  columns,
  rows,
}: ExportOptions<T>): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ระบบติดตามการส่งเคลม BMS";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(title.slice(0, 31), {
    views: [{ state: "frozen", ySplit: subtitle ? 3 : 2 }],
  });

  const lastColumn = columns.length;

  sheet.mergeCells(1, 1, 1, lastColumn);
  const titleCell = sheet.getCell(1, 1);
  titleCell.value = title;
  titleCell.font = { size: 14, bold: true, color: { argb: "FF1A2231" } };
  titleCell.alignment = { vertical: "middle" };
  sheet.getRow(1).height = 24;

  if (subtitle) {
    sheet.mergeCells(2, 1, 2, lastColumn);
    const subtitleCell = sheet.getCell(2, 1);
    subtitleCell.value = subtitle;
    subtitleCell.font = { size: 10, color: { argb: "FF6B7688" } };
  }

  const headerRowIndex = subtitle ? 3 : 2;
  const headerRow = sheet.getRow(headerRowIndex);

  columns.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = column.header;
    cell.font = { bold: true, color: { argb: HEADER_TEXT } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_FILL },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    sheet.getColumn(index + 1).width = column.width;
  });
  headerRow.height = 22;

  rows.forEach((row, rowIndex) => {
    const excelRow = sheet.getRow(headerRowIndex + 1 + rowIndex);

    columns.forEach((column, columnIndex) => {
      const cell = excelRow.getCell(columnIndex + 1);
      cell.value = column.value(row);

      const numberFormat = formatFor(column.format);
      if (numberFormat) cell.numFmt = numberFormat;

      cell.alignment = {
        vertical: "middle",
        horizontal:
          column.format === "number" || column.format === "percent"
            ? "right"
            : "left",
      };

      // แถบสลับสีช่วยให้สายตาไล่แถวยาว ๆ ไม่หลุด
      if (rowIndex % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: STRIPE_FILL },
        };
      }

      cell.border = {
        bottom: { style: "hair", color: { argb: BORDER_COLOR } },
      };
    });
  });

  sheet.autoFilter = {
    from: { row: headerRowIndex, column: 1 },
    to: { row: headerRowIndex + rows.length, column: lastColumn },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = buildFileName(title);
  link.click();
  URL.revokeObjectURL(url);
}
