import { NextResponse } from "next/server";
import {
  getClaimRecords,
  getProviderSummaries,
  getSubmissionBatches,
} from "@/mocks/generator";
import { matchesCode } from "@/lib/domain/provider";
import type { ClaimRecord } from "@/lib/domain/claim";
import type { Paginated } from "@/lib/domain/summary";


/** รายการที่เจ้าหน้าที่ต้องตามแก้อยู่ระดับ VN ไม่ใช่ระดับรอบการส่ง */
interface ProviderClaimRecord extends ClaimRecord {
  batchId: string;
  submittedAt: string;
}

function toLocalDay(iso: string): string {
  const d = new Date(iso);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

export async function handle(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const { searchParams } = new URL(request.url);
  const outcome = searchParams.get("outcome") ?? "failed";
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = (searchParams.get("q") ?? "").trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? 10));

  const provider = getProviderSummaries().find((p) => matchesCode(p, code));
  if (!provider) {
    return NextResponse.json(
      { error: "PROVIDER_NOT_FOUND", message: "ไม่พบหน่วยบริการรหัสนี้" },
      { status: 404 },
    );
  }

  /**
   * 🔴 ห้าม slice จาก ISO string ตรง ๆ เพราะนั่นเป็นเวลา UTC
   * เวลาไทยเป็น UTC+7 รายการที่ส่งตอน 6 โมงเช้าจะถูกนับเป็นวันก่อนหน้า
   * ต้องแปลงเป็นวันที่แบบเวลาท้องถิ่นก่อนเทียบเสมอ (CLAUDE.md ข้อ 4.5)
   */
  const batches = getSubmissionBatches().filter((b) => {
    if (b.providerCode !== provider.newCode) return false;
    const day = toLocalDay(b.submittedAt);
    if (from && day < from) return false;
    if (to && day > to) return false;
    return true;
  });

  let rows: ProviderClaimRecord[] = batches.flatMap((batch) =>
    getClaimRecords(batch.batchId).map((record) => ({
      ...record,
      batchId: batch.batchId,
      submittedAt: batch.submittedAt,
    })),
  );

  if (outcome !== "all") {
    rows = rows.filter((r) => r.outcome === outcome);
  }
  if (q) {
    const needle = q.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.vn.includes(q) ||
        r.batchId.toLowerCase().includes(needle) ||
        r.responses?.some((response) =>
          response.code.toLowerCase().includes(needle),
        ),
    );
  }

  rows.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  /**
   * ส่งยอดสรุปของช่วงนี้มาด้วย เพราะการ์ดด้านบนต้องขยับตามช่วงวันที่เดียวกัน
   * ถ้าการ์ดใช้ยอดรวมทั้งหมดแต่ตารางกรองตามช่วง ผู้ใช้จะเห็นเลขขัดกันเอง
   */
  const all = batches.flatMap((batch) => getClaimRecords(batch.batchId));
  const summary = {
    total: all.length,
    success: all.filter((r) => r.outcome === "success").length,
    failed: all.filter((r) => r.outcome === "failed").length,
    pending: all.filter((r) => r.outcome === "pending").length,
  };

  const start = (page - 1) * pageSize;
  const body: Paginated<ProviderClaimRecord> & { summary: typeof summary } = {
    summary,
    rows: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };

  await new Promise((resolve) => setTimeout(resolve, 250));
  return NextResponse.json(body);
}
