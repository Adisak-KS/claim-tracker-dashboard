import { NextResponse } from "next/server";
import { getSubmissionBatches } from "@/mocks/generator";
import type { SubmissionBatch } from "@/lib/domain/claim";
import type { Paginated } from "@/lib/domain/summary";


export async function handle(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const outcome = searchParams.get("outcome");
  const system = searchParams.get("system");
  const sort = searchParams.get("sort") ?? "submittedAt";
  const direction = searchParams.get("direction") === "asc" ? 1 : -1;
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

  /** เรียงทั้งชุดก่อนตัดหน้า ไม่งั้นจะเรียงแค่ 10 แถวที่เห็นซึ่งได้ผลผิด */
  const sorted = [...rows].sort((a, b) => {
    if (sort === "providerName")
      return a.providerName.localeCompare(b.providerName, "th") * direction;
    if (sort === "submittedAt")
      return a.submittedAt.localeCompare(b.submittedAt) * direction;
    const key = sort as keyof Pick<
      SubmissionBatch,
      "total" | "success" | "failed"
    >;
    return ((a[key] ?? 0) - (b[key] ?? 0)) * direction;
  });

  const start = (page - 1) * pageSize;
  const body: Paginated<SubmissionBatch> = {
    rows: sorted.slice(start, start + pageSize),
    total: sorted.length,
    page,
    pageSize,
  };

  await new Promise((resolve) => setTimeout(resolve, 300));
  return NextResponse.json(body);
}
