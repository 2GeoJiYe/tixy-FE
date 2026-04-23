import { useAdminClosedRoomsQuery } from "@/features/support/api/support";
import { AdminSupportWorkspace } from "@/features/admin-support/components/admin-support-workspace";

export function AdminSupportClosedPage() {
  const query = useAdminClosedRoomsQuery({ page: 1, size: 20 });

  return (
    <AdminSupportWorkspace
      title="종료 문의"
      list={query.data}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
    />
  );
}
