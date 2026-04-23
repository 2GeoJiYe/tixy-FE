import { useAdminStaleRoomsQuery } from "@/features/support/api/support";
import { AdminSupportWorkspace } from "@/features/admin-support/components/admin-support-workspace";

export function AdminSupportStalePage() {
  const query = useAdminStaleRoomsQuery({ page: 1, size: 20 });

  return (
    <AdminSupportWorkspace
      title="Stale 문의"
      list={query.data}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
    />
  );
}
