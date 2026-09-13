import { NextResponse } from "next/server";
import { getTopProviders, getTypeBreakdown } from "@/mocks/generator";


const ALLOWED_LIMITS = [10, 20, 50, 100];

export async function handle(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = Number(searchParams.get("limit") ?? 10);
  const limit = ALLOWED_LIMITS.includes(requested) ? requested : 10;

  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    limit,
    topProviders: getTopProviders(limit),
    typeBreakdown: getTypeBreakdown(),
  });
}
