import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  try {
    const { days } = await request.json();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days || 7));

    const startStr = startDate.toISOString().split("T")[0];
    const endStr = endDate.toISOString().split("T")[0];

    const [entriesRes, ratingsRes] = await Promise.all([
      supabase
        .from("entries")
        .select("*")
        .gte("date", startStr)
        .lte("date", endStr)
        .order("date", { ascending: true })
        .order("time", { ascending: true }),
      supabase
        .from("daily_ratings")
        .select("*")
        .gte("date", startStr)
        .lte("date", endStr)
        .order("date", { ascending: true }),
    ]);

    if (entriesRes.error) {
      return NextResponse.json({ error: entriesRes.error.message }, { status: 500 });
    }
    if (ratingsRes.error) {
      return NextResponse.json({ error: ratingsRes.error.message }, { status: 500 });
    }

    const entries = entriesRes.data;
    const ratings = ratingsRes.data;

    if (entries.length === 0 && ratings.length === 0) {
      return NextResponse.json({
        analysis: "Not enough data to analyze. Keep logging entries and ratings for a few days!",
      });
    }

    // Build a structured summary for Claude to analyze
    const dayMap: Record<string, { entries: typeof entries; rating: (typeof ratings)[0] | null }> = {};

    for (const entry of entries) {
      if (!dayMap[entry.date]) dayMap[entry.date] = { entries: [], rating: null };
      dayMap[entry.date].entries.push(entry);
    }
    for (const rating of ratings) {
      if (!dayMap[rating.date]) dayMap[rating.date] = { entries: [], rating: null };
      dayMap[rating.date].rating = rating;
    }

    const daySummaries = Object.entries(dayMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, { entries: dayEntries, rating }]) => {
        const entryLines = dayEntries.map((e) => {
          let line = `  - [${e.time}] ${e.category}: ${e.item}`;
          if (e.quantity) line += ` (${e.quantity})`;
          if (e.duration) line += ` (${e.duration})`;
          if (e.calories) line += ` [${e.calories} cal]`;
          return line;
        });

        let dayBlock = `${date} (${new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })}):\n`;
        dayBlock += entryLines.length > 0 ? entryLines.join("\n") : "  (no entries logged)";
        if (rating) {
          dayBlock += `\n  Energy Rating: ${rating.energy_rating}/10`;
          if (rating.sleep_rating) dayBlock += ` | Sleep Rating: ${rating.sleep_rating}/10`;
        }
        return dayBlock;
      });

    const prompt = `You are a personal health and energy analyst. Analyze this person's daily log data and find patterns that affect their energy and sleep levels.

DATA (${days} days):
${daySummaries.join("\n\n")}

ANALYSIS INSTRUCTIONS:
1. Look for correlations between specific activities/foods/hydration and energy/sleep ratings
2. Consider timing of entries (morning vs afternoon vs evening habits)
3. Look at consistency patterns (what happens on days they do vs don't do certain things)
4. Note any food/hydration/exercise combinations that correlate with higher or lower energy
5. If there's not enough variation in the data, say so and suggest what to track differently

FORMAT YOUR RESPONSE AS:
- Start with a brief overall summary (2-3 sentences)
- Then list specific findings as bullet points with the pattern and the evidence
- End with 2-3 actionable suggestions for improving energy/sleep
- Keep it concise and personal (use "you" language)
- Use plain text, no markdown headers`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    return NextResponse.json({
      analysis: content.text,
      stats: {
        days_analyzed: Object.keys(dayMap).length,
        total_entries: entries.length,
        avg_energy: ratings.length > 0
          ? (ratings.reduce((s, r) => s + r.energy_rating, 0) / ratings.length).toFixed(1)
          : null,
        avg_sleep: ratings.filter((r) => r.sleep_rating).length > 0
          ? (ratings.filter((r) => r.sleep_rating).reduce((s, r) => s + (r.sleep_rating || 0), 0) / ratings.filter((r) => r.sleep_rating).length).toFixed(1)
          : null,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate analysis: ${message}` },
      { status: 500 }
    );
  }
}
