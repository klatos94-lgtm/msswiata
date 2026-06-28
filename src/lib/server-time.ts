"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "./supabase";

let cachedOffsetMs: number | null = null;
let syncPromise: Promise<number> | null = null;

export async function syncServerTime(): Promise<number> {
  if (cachedOffsetMs !== null) return cachedOffsetMs;
  if (syncPromise) return syncPromise;

  syncPromise = (async () => {
    try {
      const supabase = getSupabaseClient();
      const before = Date.now();
      const { data, error } = await supabase.rpc("get_server_time");
      const after = Date.now();

      if (error || !data) {
        console.warn("Failed to fetch server time, falling back to local time:", error);
        cachedOffsetMs = 0;
        return 0;
      }

      const serverTimeMs = new Date(data as string).getTime();
      const roundTripMs = after - before;
      const estimatedServerTimeMs = serverTimeMs + roundTripMs / 2;
      cachedOffsetMs = estimatedServerTimeMs - after;
      return cachedOffsetMs;
    } catch (e) {
      console.warn("Failed to sync server time, falling back to local time:", e);
      cachedOffsetMs = 0;
      return 0;
    }
  })();

  return syncPromise;
}

export function getServerNow(): Date {
  const offset = cachedOffsetMs ?? 0;
  return new Date(Date.now() + offset);
}

export function getServerNowMs(): number {
  const offset = cachedOffsetMs ?? 0;
  return Date.now() + offset;
}

export function useServerTime() {
  const [offset, setOffset] = useState<number>(cachedOffsetMs ?? 0);
  const [loading, setLoading] = useState(cachedOffsetMs === null);

  useEffect(() => {
    if (cachedOffsetMs !== null) {
      setOffset(cachedOffsetMs);
      setLoading(false);
      return;
    }
    syncServerTime().then((off) => {
      setOffset(off);
      setLoading(false);
    });
  }, []);

  return {
    now: new Date(Date.now() + offset),
    offset,
    loading,
  };
}
