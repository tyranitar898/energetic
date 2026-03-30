import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (url.startsWith("http") && key.length > 20) {
    _supabase = createClient(url, key);
  }

  return _supabase;
}

// Keep backward compat
export const supabase = null as SupabaseClient | null;
