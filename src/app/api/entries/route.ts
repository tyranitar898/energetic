import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json({
      error: "Supabase not configured",
      debug: {
        urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        keySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("date", date)
    .order("time", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({
      error: "Supabase not configured",
      debug: {
        urlSet: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        keySet: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      }
    }, { status: 503 });
  }

  try {
    const body = await request.json();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("entries")
      .insert({
        date: today,
        time: body.time,
        category: body.category,
        item: body.item,
        quantity: body.quantity,
        duration: body.duration,
        calories: body.calories,
        raw_text: body.raw_text,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Entry creation error:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}
