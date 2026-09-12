"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type { IssueGroupRank } from "@/lib/domain/summary";

export function useIssues() {
  return useQuery({
    queryKey: ["issues"],
    queryFn: () => apiGet<{ rows: IssueGroupRank[] }>("/api/issues"),
  });
}
