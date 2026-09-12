import { NextResponse } from "next/server";
import { getProviderSummaries, getSubmissionBatches } from "@/mocks/generator";
import { matchesCode } from "@/lib/domain/provider";

/** ระบบเก่าส่งรหัส 5 หลัก ระบบใหม่ส่ง 9 หลักใหม่ ต้องหาเจอทั้งคู่ */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const provider = getProviderSummaries().find((p) => matchesCode(p, code));

  if (!provider) {
    return NextResponse.json(
      { error: "PROVIDER_NOT_FOUND", message: "ไม่พบหน่วยบริการรหัสนี้" },
      { status: 404 },
    );
  }

  const batches = getSubmissionBatches()
    .filter((b) => b.providerCode === provider.newCode)
    .slice(0, 20);

  await new Promise((resolve) => setTimeout(resolve, 300));
  return NextResponse.json({ provider, batches });
}
