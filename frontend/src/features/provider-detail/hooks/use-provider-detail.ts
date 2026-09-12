"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type { SubmissionBatch } from "@/lib/domain/claim";
import type { ProviderSummary } from "@/lib/domain/summary";

export interface ProviderDetail {
  provider: ProviderSummary;
  batches: SubmissionBatch[];
}

export function useProviderDetail(code: string) {
  return useQuery({
    queryKey: ["provider-detail", code],
    queryFn: () => apiGet<ProviderDetail>(`/api/providers/${code}`),
  });
}
