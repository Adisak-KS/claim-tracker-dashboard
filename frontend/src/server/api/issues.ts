import { NextResponse } from "next/server";
import { getIssueGroupRanks } from "@/mocks/generator";


export async function handle(request: Request) {
  const { searchParams } = new URL(request.url);
  const zone = searchParams.get("zone") ?? "all";
  const system = searchParams.get("system") ?? "all";

  await new Promise((resolve) => setTimeout(resolve, 300));
  return NextResponse.json({ rows: getIssueGroupRanks(1, { zone, system }) });
}
