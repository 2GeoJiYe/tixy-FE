import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/app/providers/auth-provider";
import { mainApiClient } from "@/shared/api/clients";
import type { SalesDashboardFilters, SalesDashboardResponse } from "@/features/admin-dashboard/types";

export function useSalesDashboardQuery(filters: SalesDashboardFilters) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ["sales-dashboard", filters],
    queryFn: () =>
      mainApiClient.request<SalesDashboardResponse>("/dashboard/v1/sales", {
        method: "GET",
        token: accessToken,
        query: {
          ...filters,
          eventId: filters.eventId,
        },
      }),
  });
}
