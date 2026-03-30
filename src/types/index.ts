export interface Entry {
  id: string;
  user_id: string;
  date: string;
  time: string;
  category: "food" | "hydration" | "exercise" | "sleep" | "supplement" | "other";
  item: string;
  quantity: string | null;
  duration: string | null;
  calories: number | null;
  raw_text: string;
  created_at: string;
}

export interface DailyRating {
  id: string;
  user_id: string;
  date: string;
  energy_rating: number;
  sleep_rating: number | null;
  notes: string | null;
  created_at: string;
}

export interface ParsedEntry {
  category: Entry["category"];
  item: string;
  time: string;
  quantity: string | null;
  duration: string | null;
  calories: number | null;
}
