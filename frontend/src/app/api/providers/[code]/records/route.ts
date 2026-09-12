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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const { searchParams } = new URL(request.url);
  const outcome = searchParams.get("outcome") ?? "failed";
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

  const batches = getSubmissionBatches().filter(
    (b) => b.providerCode === provider.newCode,
  );

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
    rows = rows.filter(
      (r) =>
        r.vn.includes(q) ||
        r.responses?.some((response) => response.code.includes(q)),
    );
  }

  rows.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const start = (page - 1) * pageSize;
  const body: Paginated<ProviderClaimRecord> = {
    rows: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };

  await new Promise((resolve) => setTimeout(resolve, 250));
  return NextResponse.json(body);
}
