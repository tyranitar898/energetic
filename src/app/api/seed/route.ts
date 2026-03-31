import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  const entries = [];
  const ratings = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    entries.push({
      user_id: user.id,
      date: dateStr,
      time: "09:00 AM",
      category: "food",
      item: "PB&J sandwich",
      quantity: "1 sandwich",
      duration: null,
      calories: 350,
      raw_text: "I had a PB&J sandwich at 9am",
    });

    entries.push({
      user_id: user.id,
      date: dateStr,
      time: "12:00 PM",
      category: "hydration",
      item: "Water",
      quantity: "2L",
      duration: null,
      calories: 0,
      raw_text: "I had 2L of water at noon",
    });

    const energyRating = [6, 7, 5, 8, 4, 7, 6][i];
    const sleepRating = [7, 8, 5, 9, 4, 7, 6][i];

    ratings.push({
      user_id: user.id,
      date: dateStr,
      energy_rating: energyRating,
      sleep_rating: sleepRating,
      notes: null,
    });
  }

  const { error: entriesError } = await supabase.from("entries").insert(entries);
  if (entriesError) {
    return NextResponse.json({ error: entriesError.message }, { status: 500 });
  }

  const { error: ratingsError } = await supabase.from("daily_ratings").insert(ratings);
  if (ratingsError) {
    return NextResponse.json({ error: ratingsError.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Seeded 7 days of data", entries: entries.length, ratings: ratings.length });
}
