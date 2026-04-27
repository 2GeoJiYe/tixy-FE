import { useAuth } from "@/app/providers/auth-provider";
import { AdminSupportWorkspace } from "@/features/admin-support/components/admin-support-workspace";
import { useMyRoomsQuery } from "@/features/support/api/support";

export function AdminSupportAssignedPage() {
  const { user } = useAuth();
  const query = useMyRoomsQuery({ page: 1, size: 20 });
  const title = user?.role === "ROLE_SUPER_ADMIN" ? "전체 문의" : "담당 중 문의";

  return (
    <AdminSupportWorkspace
      title={title}
      scope="assigned"
      list={query.data}
      isLoading={query.isLoading}
      isError={query.isError}
      onRetry={() => query.refetch()}
    />
  );
}
