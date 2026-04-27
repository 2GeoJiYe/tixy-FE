import { useQueryClient } from "@tanstack/react-query";
import { AdminSupportWorkspace } from "@/features/admin-support/components/admin-support-workspace";
import { useAdminQueueQuery } from "@/features/support/api/support";
import { useSupportRealtime } from "@/features/support/realtime/use-support-realtime";

export function AdminSupportQueuePage() {
  const queryClient = useQueryClient();
  const queueQuery = useAdminQueueQuery({ page: 1, size: 20 });

  useSupportRealtime({
    subscribeQueue: true,
    onQueueEvent: () => {
      queryClient.invalidateQueries({ queryKey: ["support", "queue"] });
      queryClient.invalidateQueries({ queryKey: ["support"] });
    },
  });

  return (
    <AdminSupportWorkspace
      title="대기열"
      scope="queue"
      list={queueQuery.data}
      isLoading={queueQuery.isLoading}
      isError={queueQuery.isError}
      onRetry={() => queueQuery.refetch()}
    />
  );
}
