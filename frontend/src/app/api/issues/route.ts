import { NextResponse } from "next/server";
import { getIssueGroupRanks } from "@/mocks/generator";

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return NextResponse.json({ rows: getIssueGroupRanks() });
}
