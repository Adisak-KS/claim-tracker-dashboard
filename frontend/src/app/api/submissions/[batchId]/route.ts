import { NextResponse } from "next/server";
import { getClaimRecords, getSubmissionBatches } from "@/mocks/generator";
import type { ClaimRecord } from "@/lib/domain/claim";
import type { Paginated } from "@/lib/domain/summary";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ batchId: string }> },
) {
  const { batchId } = await params;
  const { searchParams } = new URL(request.url);
  const outcome = searchParams.get("outcome");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? 10));

  const batch = getSubmissionBatches().find((b) => b.batchId === batchId);
  if (!batch) {
    return NextResponse.json(
      { error: "BATCH_NOT_FOUND", message: "ไม่พบรอบการส่งนี้" },
      { status: 404 },
    );
  }

  let records = getClaimRecords(batchId);
  if (outcome && outcome !== "all") {
    records = records.filter((r) => r.outcome === outcome);
  }

  const start = (page - 1) * pageSize;
  const body: Paginated<ClaimRecord> & { batch: typeof batch } = {
    batch,
    rows: records.slice(start, start + pageSize),
    total: records.length,
    page,
    pageSize,
  };

  await new Promise((resolve) => setTimeout(resolve, 250));
  return NextResponse.json(body);
}
