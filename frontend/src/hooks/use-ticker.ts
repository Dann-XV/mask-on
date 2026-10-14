"use client";

import { useEffect, useState } from "react";

/** Shared clock so every bubble's TTL animation advances on the same beat. */
export function useTicker(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
