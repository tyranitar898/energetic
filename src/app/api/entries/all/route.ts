import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: Request) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("user_id");

  let entriesQuery = supabase
    .from("entries")
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: true });

  let ratingsQuery = supabase
    .from("daily_ratings")
    .select("*")
    .order("date", { ascending: false });

  if (userId) {
    entriesQuery = entriesQuery.eq("user_id", userId);
    ratingsQuery = ratingsQuery.eq("user_id", userId);
  }

  const { data: entries, error: entriesError } = await entriesQuery;

  if (entriesError) {
    return NextResponse.json({ error: entriesError.message }, { status: 500 });
  }

  const { data: ratings, error: ratingsError } = await ratingsQuery;

  if (ratingsError) {
    return NextResponse.json({ error: ratingsError.message }, { status: 500 });
  }

  return NextResponse.json({ entries, ratings });
}
