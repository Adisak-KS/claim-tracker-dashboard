import { NextResponse } from "next/server";
import { getProviderSummaries } from "@/mocks/generator";
import type { Paginated, ProviderSummary } from "@/lib/domain/summary";

type SortKey = "urgency" | "failedCount" | "successRate" | "totalSent" | "name";

/** ให้น้ำหนักอัตราที่พัง ไม่ใช่เลขดิบ รายเล็กจึงไม่ถูกกลบด้วยรายใหญ่ */
function urgencyScore(p: ProviderSummary): number {
  return (p.failedCount / (p.totalSent || 1)) * Math.log10(p.failedCount + 10);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const zone = searchParams.get("zone");
  const system = searchParams.get("system");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const sort = (searchParams.get("sort") ?? "urgency") as SortKey;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? 25));

  let rows = getProviderSummaries();

  if (q) {
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.includes(q) ||
        r.province.toLowerCase().includes(q),
    );
  }
  if (zone && zone !== "all") {
    rows = rows.filter((r) => String(r.healthZone) === zone);
  }
  if (system && system !== "all") {
    rows = rows.filter((r) => r.sourceSystem === system);
  }
  if (type && type !== "all") {
    rows = rows.filter((r) => r.type === type);
  }
  if (status === "problem") {
    rows = rows.filter((r) => r.failedCount > 0);
  } else if (status === "silent") {
    rows = rows.filter((r) => r.isSilent);
  } else if (status === "healthy") {
    rows = rows.filter((r) => r.failedCount === 0 && !r.isSilent);
  }

  const sorted = [...rows].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name, "th");
    if (sort === "successRate") return a.successRate - b.successRate;
    if (sort === "urgency") return urgencyScore(b) - urgencyScore(a);
    return b[sort] - a[sort];
  });

  const start = (page - 1) * pageSize;
  const body: Paginated<ProviderSummary> = {
    rows: sorted.slice(start, start + pageSize),
    total: sorted.length,
    page,
    pageSize,
  };

  await new Promise((resolve) => setTimeout(resolve, 350));
  return NextResponse.json(body);
}
