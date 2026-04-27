import { AdminSupportWorkspace } from "@/features/admin-support/components/admin-support-workspace";
import { useAdminStaleRoomsQuery } from "@/features/support/api/support";

export function AdminSupportStalePage() {
  const query = useAdminStaleRoomsQuery({ page: 1, size: 20 });

  return (
    <AdminSupportWorkspace
      title="장기 미응답 문의"
      scope="stale"
      list={query.data}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
    />
  );
}
