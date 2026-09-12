"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type { ProviderSummary } from "@/lib/domain/summary";

export interface ProviderDetail {
  provider: ProviderSummary;
}

export function useProviderDetail(code: string) {
  return useQuery({
    queryKey: ["provider-detail", code],
    queryFn: () => apiGet<ProviderDetail>(`/api/providers/${code}`),
  });
}
