import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const GLOBAL_KEY = "__msswiata_supabase_client";

export function getSupabaseClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    const existing = (window as any)[GLOBAL_KEY] as SupabaseClient | undefined;
    if (existing) return existing;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "msswiata-auth",
    },
  });

  if (typeof window !== "undefined") {
    (window as any)[GLOBAL_KEY] = client;
  }

  return client;
}
