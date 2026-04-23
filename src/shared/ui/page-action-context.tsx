import { PropsWithChildren, ReactNode, createContext, useContext, useMemo, useState } from "react";

interface PageActionContextValue {
  action: ReactNode;
  setAction: (action: ReactNode) => void;
  clearAction: () => void;
}

const PageActionContext = createContext<PageActionContextValue | null>(null);

export function PageActionProvider({ children }: PropsWithChildren) {
  const [action, setAction] = useState<ReactNode>(null);

  const value = useMemo<PageActionContextValue>(
    () => ({
      action,
      setAction,
      clearAction: () => setAction(null),
    }),
    [action],
  );

  return <PageActionContext.Provider value={value}>{children}</PageActionContext.Provider>;
}

export function usePageAction() {
  const context = useContext(PageActionContext);
  if (!context) {
    throw new Error("usePageAction must be used within PageActionProvider");
  }

  return context;
}
