"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type {
  ProviderSummary,
  ProviderTypeBreakdown,
} from "@/lib/domain/summary";

export interface ReportData {
  limit: number;
  topProviders: ProviderSummary[];
  typeBreakdown: ProviderTypeBreakdown[];
}

export function useReports(limit: number) {
  return useQuery({
    queryKey: ["reports", limit],
    queryFn: () => apiGet<ReportData>("/api/reports", { limit }),
    placeholderData: keepPreviousData,
  });
}
