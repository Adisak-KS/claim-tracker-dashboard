import { NextResponse } from "next/server";
import { getSubmissionBatches } from "@/mocks/generator";
import type { SubmissionBatch } from "@/lib/domain/claim";
import type { Paginated } from "@/lib/domain/summary";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const outcome = searchParams.get("outcome");
  const system = searchParams.get("system");
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? 10));

  let rows = getSubmissionBatches();

  if (q) {
    rows = rows.filter(
      (r) =>
        r.providerName.toLowerCase().includes(q) ||
        r.providerCode.toLowerCase().includes(q) ||
        r.batchId.toLowerCase().includes(q) ||
        r.province.toLowerCase().includes(q),
    );
  }
  if (outcome && outcome !== "all") {
    rows = rows.filter((r) => r.outcome === outcome);
  }
  if (system && system !== "all") {
    rows = rows.filter((r) => r.sourceSystem === system);
  }

  const start = (page - 1) * pageSize;
  const body: Paginated<SubmissionBatch> = {
    rows: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };

  await new Promise((resolve) => setTimeout(resolve, 300));
  return NextResponse.json(body);
}
