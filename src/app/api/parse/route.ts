import { NextResponse } from "next/server";
import { parseEntry } from "@/lib/parse-entry";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const parsed = await parseEntry(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse entry" },
      { status: 500 }
    );
  }
}
