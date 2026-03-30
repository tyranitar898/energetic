import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const anthropic = process.env.ANTHROPIC_API_KEY || "";

  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: url ? `${url.substring(0, 20)}...` : "NOT SET",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: key ? `${key.substring(0, 10)}... (len: ${key.length})` : "NOT SET",
    ANTHROPIC_API_KEY: anthropic ? `${anthropic.substring(0, 10)}... (len: ${anthropic.length})` : "NOT SET",
    urlStartsWithHttp: url.startsWith("http"),
    keyLengthOver20: key.length > 20,
  });
}
