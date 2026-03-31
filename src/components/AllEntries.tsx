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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addDate, setAddDate] = useState<string | null>(null);
  const [addText, setAddText] = useState("");
  const [addStatus, setAddStatus] = useState("");
  const [isAdding, setIsAdding] = useState(false);

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

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/entries?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) {
        setEntries((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
    } finally {
      setDeletingId(null);
    }
  }

  function refreshEntries() {
    fetch("/api/entries/all")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.entries || []);
        setRatings(data.ratings || []);
      })
      .catch(console.error);
  }

  async function handleAddEntry(e: React.FormEvent) {
    e.preventDefault();
    if (!addText.trim() || !addDate) return;

    setIsAdding(true);
    setAddStatus("Parsing with AI...");

    try {
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: addText }),
      });
      if (!parseRes.ok) throw new Error("Failed to parse");
      const parsed = await parseRes.json();

      setAddStatus("Saving...");

      const entryRes = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed,
          raw_text: addText,
          date: addDate,
        }),
      });
      if (!entryRes.ok) throw new Error("Failed to save");

      setAddText("");
      setAddDate(null);
      setAddStatus("");
      refreshEntries();
    } catch {
      setAddStatus("Error saving entry.");
    } finally {
      setIsAdding(false);
    }
  }

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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      {addDate === null ? (
        <button
          onClick={() => setAddDate(today)}
          className="flex items-center gap-2 rounded-lg border border-dashed border-zinc-300 px-4 py-2.5 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:hover:border-zinc-500 dark:hover:text-zinc-300 transition-colors w-full justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          Add entry to a past date
        </button>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Add entry to past date</h3>
            <button
              onClick={() => { setAddDate(null); setAddText(""); setAddStatus(""); }}
              className="rounded-md p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <form onSubmit={handleAddEntry} className="space-y-2">
            <input
              type="date"
              value={addDate}
              max={today}
              onChange={(e) => setAddDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={addText}
                onChange={(e) => setAddText(e.target.value)}
                placeholder="e.g. Had oatmeal at 8am"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
              />
              <button
                type="submit"
                disabled={!addText.trim() || isAdding}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {isAdding ? "..." : "Add"}
              </button>
            </div>
          </form>
          {addStatus && (
            <p className="mt-2 text-xs text-zinc-500">{addStatus}</p>
          )}
        </div>
      )}

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
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{dateLabel}</h3>
                <button
                  onClick={() => { setAddDate(date); setAddText(""); setAddStatus(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="rounded-md p-0.5 text-zinc-300 hover:text-zinc-600 dark:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  title={`Add entry to ${dateLabel}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                </button>
              </div>
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
                  className="flex items-center gap-2 text-sm group"
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
                  <button
                    onClick={() => handleDelete(entry.id)}
                    disabled={deletingId === entry.id}
                    className="ml-auto shrink-0 rounded-md p-1 text-zinc-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 dark:text-zinc-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-all disabled:opacity-50"
                    title="Delete entry"
                  >
                    {deletingId === entry.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
