"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api/client";
import type { Paginated, ProviderSummary } from "@/lib/domain/summary";

export interface ProviderFilters {
  q: string;
  zone: string;
  system: string;
  type: string;
  status: string;
  sort: string;
  direction: string;
  page: number;
  pageSize: number;
}

export function useProviders(filters: ProviderFilters) {
  return useQuery({
    queryKey: ["providers", filters],
    queryFn: () =>
      apiGet<Paginated<ProviderSummary>>("/api/providers", { ...filters }),
    // คงข้อมูลหน้าเดิมไว้ระหว่างเปลี่ยนหน้า ตารางจะได้ไม่กระพริบเป็นจอว่าง
    placeholderData: keepPreviousData,
  });
}
