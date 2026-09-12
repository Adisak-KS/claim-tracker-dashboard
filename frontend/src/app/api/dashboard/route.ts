import { NextResponse } from "next/server";
import { getDashboardSummary } from "@/mocks/generator";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // หน่วงให้เห็น loading state จริงตอนพัฒนา ของจริงไม่มีบรรทัดนี้
  await new Promise((resolve) => setTimeout(resolve, 450));

  return NextResponse.json(getDashboardSummary(from, to));
}
