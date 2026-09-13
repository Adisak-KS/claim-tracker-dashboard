import { AppShell } from "@/components/layout/app-shell";
import { ProviderDetailView } from "@/features/provider-detail/components/provider-detail-view";
import {
  getProviderSummaries,
  getSubmissionBatches,
} from "@/mocks/generator";

export const metadata = { title: "รายละเอียดหน่วยบริการ | ระบบติดตามการส่งเคลม" };

/**
 * โหมดไฟล์นิ่งต้องรู้ล่วงหน้าว่าจะสร้างหน้าไหนบ้าง
 *
 * สร้างครบทุกหน่วยไม่ได้ เพราะ 5,013 หน้าคิดเป็นราว 260 MB ซึ่งใหญ่เกินไป
 * สำหรับ repo ที่ต้องดึงขึ้น GitHub
 *
 * จึงจำกัดที่หน่วยซึ่งโผล่ในหน้าแรกของรายการล่าสุด (แท็บเริ่มต้นที่เห็นก่อน)
 * บวกหน่วยอันดับต้น หน่วยที่ไม่ได้สร้างจะเข้าไม่ได้ ซึ่งรับได้เพราะโหมดนี้
 * ใช้โชว์หน้าตาเท่านั้น ไม่ใช่ของที่ใช้งานจริง
 */
const STATIC_PROVIDER_PAGES = 150;

export function generateStaticParams() {
  if (process.env.STATIC_EXPORT !== "1") return [];

  const summaries = getProviderSummaries();
  const known = new Set(summaries.map((p) => p.newCode));
  const codes = new Set<string>();

  /** เรียงแบบเดียวกับ API รายการล่าสุด หน้าแรก ๆ จึงกดเข้าได้ทุกแถว */
  const recent = [...getSubmissionBatches()].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  );
  for (const batch of recent) {
    if (codes.size >= STATIC_PROVIDER_PAGES) break;
    if (known.has(batch.providerCode)) codes.add(batch.providerCode);
  }

  for (const p of [...summaries]
    .sort((a, b) => b.totalSent - a.totalSent)
    .slice(0, 50)) {
    codes.add(p.newCode);
  }

  return [...codes].map((code) => ({ code }));
}

export default async function ProviderDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <AppShell title="รายละเอียดหน่วยบริการ">
      <ProviderDetailView code={code} />
    </AppShell>
  );
}
