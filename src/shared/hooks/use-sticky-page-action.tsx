import { ReactNode, useEffect } from "react";
import { usePageAction } from "@/shared/ui/page-action-context";

export function useStickyPageAction(action: ReactNode, enabled = true) {
  const { setAction, clearAction } = usePageAction();

  useEffect(() => {
    if (!enabled) {
      clearAction();
      return;
    }

    setAction(action);
    return () => clearAction();
  }, [action, clearAction, enabled, setAction]);
}
