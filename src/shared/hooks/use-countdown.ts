import { useEffect, useMemo, useState } from "react";

export function useCountdown(expiresAt: string | null | undefined) {
  const calculateRemaining = () => {
    if (!expiresAt) {
      return 0;
    }

    return Math.max(0, new Date(expiresAt).getTime() - Date.now());
  };

  const [remaining, setRemaining] = useState(calculateRemaining);

  useEffect(() => {
    setRemaining(calculateRemaining());

    const timer = window.setInterval(() => {
      setRemaining(calculateRemaining());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  return useMemo(
    () => ({
      remaining,
      expired: remaining <= 0,
    }),
    [remaining],
  );
}
