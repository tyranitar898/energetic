"use client";

import { useState, useEffect } from "react";
import { Entry, DailyRating } from "@/types";

const categoryIcons: Record<string, string> = {
  food: "🍽",
  hydration: "💧",
  exercise: "🏃",
  sleep: "😴",
  supplement: "💊",
  other: "📝",
};

const categoryColors: Record<string, string> = {
  food: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  hydration: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  exercise: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  sleep: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  supplement: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  other: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
};

export default function AllEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [ratings, setRatings] = useState<DailyRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/entries/all")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setRatings(data.ratings || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Loading history...</p>;
  }

  // Group entries by date
  const entriesByDate: Record<string, Entry[]> = {};
  for (const entry of entries) {
    if (!entriesByDate[entry.date]) entriesByDate[entry.date] = [];
    entriesByDate[entry.date].push(entry);
  }

  const ratingsByDate: Record<string, DailyRating> = {};
  for (const rating of ratings) {
    ratingsByDate[rating.date] = rating;
  }

  const dates = Object.keys(entriesByDate).sort((a, b) => b.localeCompare(a));

  if (dates.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500">No entries yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {dates.map((date) => {
        const dayEntries = entriesByDate[date];
        const rating = ratingsByDate[date];
        const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={date}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{dateLabel}</h3>
              <div className="flex gap-2">
                {rating && (
                  <>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      Energy: {rating.energy_rating}/10
                    </span>
                    {rating.sleep_rating && (
                      <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        Sleep: {rating.sleep_rating}/10
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {dayEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span>{categoryIcons[entry.category] || "📝"}</span>
                  <span className="font-medium">{entry.item}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      categoryColors[entry.category] || categoryColors.other
                    }`}
                  >
                    {entry.category}
                  </span>
                  <span className="text-zinc-400 text-xs">{entry.time}</span>
                  {entry.quantity && (
                    <span className="text-zinc-400 text-xs">{entry.quantity}</span>
                  )}
                  {entry.calories != null && entry.calories > 0 && (
                    <span className="text-zinc-400 text-xs">{entry.calories} cal</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
