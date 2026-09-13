import { NextResponse } from "next/server";
import { getProviderSummaries } from "@/mocks/generator";
import type { Paginated, ProviderSummary } from "@/lib/domain/summary";


type SortKey = "urgency" | "failedCount" | "successRate" | "totalSent" | "name";

/** ให้น้ำหนักอัตราที่พัง ไม่ใช่เลขดิบ รายเล็กจึงไม่ถูกกลบด้วยรายใหญ่ */
function urgencyScore(p: ProviderSummary): number {
  return (p.failedCount / (p.totalSent || 1)) * Math.log10(p.failedCount + 10);
}

export async function handle(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const zone = searchParams.get("zone");
  const system = searchParams.get("system");
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const sort = (searchParams.get("sort") ?? "urgency") as SortKey;
  const direction = searchParams.get("direction") === "asc" ? 1 : -1;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  /** export ต้องได้ทุกแถวที่กรองไว้ ไม่ใช่แค่หน้าที่เห็น ตัวเลขถึงจะตรงกัน */
  const exportAll = searchParams.get("all") === "1";
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? 25));

  let rows = getProviderSummaries();

  if (q) {
    rows = rows.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.newCode.toLowerCase().includes(q) ||
        r.legacyCode?.includes(q) ||
        r.shortCode?.includes(q) ||
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

  /** เรียงทั้งชุดก่อนตัดหน้า ไม่งั้นจะเรียงแค่แถวที่เห็นซึ่งได้ผลผิด */
  const sorted = [...rows].sort((a, b) => {
    if (sort === "urgency") return (urgencyScore(b) - urgencyScore(a)) * -direction;
    if (sort === "name") return a.name.localeCompare(b.name, "th") * -direction;
    return (a[sort] - b[sort]) * direction;
  });

  const start = (page - 1) * pageSize;
  const body: Paginated<ProviderSummary> = {
    rows: exportAll ? sorted : sorted.slice(start, start + pageSize),
    total: sorted.length,
    page,
    pageSize,
  };

  await new Promise((resolve) => setTimeout(resolve, 350));
  return NextResponse.json(body);
}
