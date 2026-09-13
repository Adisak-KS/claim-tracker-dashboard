"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type { IssueGroupRank } from "@/lib/domain/summary";

export function useIssues(params: { zone: string; system: string }) {
  return useQuery({
    queryKey: ["issues", params.zone, params.system],
    queryFn: () =>
      apiGet<{ rows: IssueGroupRank[] }>("/api/issues", {
        zone: params.zone,
        system: params.system,
      }),
    placeholderData: keepPreviousData,
  });
}
