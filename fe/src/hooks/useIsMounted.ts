import { useEffect, useState } from "react";

/**
 * Hook untuk mendeteksi apakah komponen sudah mount di client.
 * Digunakan untuk menghindari hydration mismatch pada komponen
 * yang bergantung pada state client-only (auth, localStorage, dll).
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  return isMounted;
}
