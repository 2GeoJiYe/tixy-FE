import { PropsWithChildren } from "react";
import { QueryProvider } from "@/app/providers/query-provider";
import { AuthProvider } from "@/app/providers/auth-provider";
import { PageActionProvider } from "@/shared/ui/page-action-context";
import { ToastProvider } from "@/shared/ui/toast";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          <PageActionProvider>{children}</PageActionProvider>
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
