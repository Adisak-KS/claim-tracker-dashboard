"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type { SubmissionBatch } from "@/lib/domain/claim";
import type { Paginated } from "@/lib/domain/summary";

export interface SubmissionFilters {
  q: string;
  outcome: string;
  system: string;
  page: number;
  pageSize: number;
}

export function useSubmissions(filters: SubmissionFilters) {
  return useQuery({
    queryKey: ["submissions", filters],
    queryFn: () =>
      apiGet<Paginated<SubmissionBatch>>("/api/submissions", { ...filters }),
    placeholderData: keepPreviousData,
  });
}
