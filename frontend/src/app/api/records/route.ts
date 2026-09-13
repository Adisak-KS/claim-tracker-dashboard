import { NextResponse } from "next/server";
import {
  getClaimRecords,
  getProviderSummaries,
  getSubmissionBatches,
} from "@/mocks/generator";
import type { ClaimRecord } from "@/lib/domain/claim";
import type { Paginated } from "@/lib/domain/summary";

/**
 * รายการเคลมล่าสุดข้ามทุกหน่วยบริการ เรียงตามเวลาที่ส่ง
 *
 * 🔴 ทุกแถวต้องมีชื่อและรหัสหน่วยบริการกำกับเสมอ
 * เพราะ vn ซ้ำกันได้ระหว่างหน่วยบริการ ถ้าไม่มีชื่อกำกับจะแยกไม่ออก
 * ว่าแถวไหนเป็นของใคร (ดู docs/design/decisions.md)
 */
interface LatestClaimRecord extends ClaimRecord {
  batchId: string;
  submittedAt: string;
  providerCode: string;
  providerName: string;
  province: string;
  healthZone: number;
  sourceSystem: string;
}

/** ดูย้อนหลังพอให้เห็นความเคลื่อนไหว ไม่ต้องไล่ทั้งฐานเพราะหน้านี้ดูของล่าสุด */
const LOOKBACK_BATCHES = 400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const outcome = searchParams.get("outcome") ?? "all";
  const zone = searchParams.get("zone") ?? "all";
  const system = searchParams.get("system") ?? "all";
  const q = (searchParams.get("q") ?? "").trim().toLowerCase();
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const pageSize = Math.min(100, Number(searchParams.get("pageSize") ?? 10));

  const providerByCode = new Map(
    getProviderSummaries().map((p) => [p.newCode, p]),
  );

  const batches = [...getSubmissionBatches()]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, LOOKBACK_BATCHES);

  let rows: LatestClaimRecord[] = [];
  for (const batch of batches) {
    const provider = providerByCode.get(batch.providerCode);
    if (!provider) continue;
    if (zone !== "all" && String(provider.healthZone) !== zone) continue;
    if (system !== "all" && provider.sourceSystem !== system) continue;

    for (const record of getClaimRecords(batch.batchId)) {
      rows.push({
        ...record,
        batchId: batch.batchId,
        submittedAt: batch.submittedAt,
        providerCode: provider.newCode,
        providerName: provider.name,
        province: provider.province,
        healthZone: provider.healthZone,
        sourceSystem: provider.sourceSystem,
      });
    }
  }

  if (outcome !== "all") {
    rows = rows.filter((r) => r.outcome === outcome);
  }
  if (q) {
    rows = rows.filter(
      (r) =>
        r.vn.includes(q) ||
        r.providerName.toLowerCase().includes(q) ||
        r.providerCode.toLowerCase().includes(q) ||
        r.responses?.some((response) =>
          response.code.toLowerCase().includes(q),
        ),
    );
  }

  rows.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  const start = (page - 1) * pageSize;
  const body: Paginated<LatestClaimRecord> = {
    rows: rows.slice(start, start + pageSize),
    total: rows.length,
    page,
    pageSize,
  };

  await new Promise((resolve) => setTimeout(resolve, 300));
  return NextResponse.json(body);
}
