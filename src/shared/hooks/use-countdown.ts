import { useEffect, useMemo, useState } from "react";
import { getKoreaTime } from "@/shared/lib/format";

export function useCountdown(expiresAt: string | null | undefined) {
  const calculateRemaining = () => {
    if (!expiresAt) {
      return 0;
    }

    return Math.max(0, getKoreaTime(expiresAt) - Date.now());
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
