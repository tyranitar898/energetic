import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const { data: entries, error: entriesError } = await supabase
    .from("entries")
    .select("*")
    .order("date", { ascending: false })
    .order("time", { ascending: true });

  if (entriesError) {
    return NextResponse.json({ error: entriesError.message }, { status: 500 });
  }

  const { data: ratings, error: ratingsError } = await supabase
    .from("daily_ratings")
    .select("*")
    .order("date", { ascending: false });

  if (ratingsError) {
    return NextResponse.json({ error: ratingsError.message }, { status: 500 });
  }

  return NextResponse.json({ entries, ratings });
}
