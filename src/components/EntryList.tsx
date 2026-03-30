"use client";

import { useState } from "react";
import { Entry } from "@/types";

interface EntryListProps {
  entries: Entry[];
  isLoading: boolean;
  onEntryDeleted?: () => void;
}

const categoryColors: Record<string, string> = {
  food: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  hydration: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  exercise: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  sleep: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  supplement: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  other: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
};

const categoryIcons: Record<string, string> = {
  food: "🍽",
  hydration: "💧",
  exercise: "🏃",
  sleep: "😴",
  supplement: "💊",
  other: "📝",
};

export default function EntryList({ entries, isLoading, onEntryDeleted }: EntryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/entries?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) onEntryDeleted?.();
    } catch (error) {
      console.error("Failed to delete entry:", error);
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500">Loading entries...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold">Today&apos;s Log</h2>

      {entries.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No entries yet. Use voice or text to log your first entry.
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-start gap-3 rounded-lg border border-zinc-100 p-3 dark:border-zinc-800"
            >
              <span className="text-xl">{categoryIcons[entry.category] || "📝"}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{entry.item}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      categoryColors[entry.category] || categoryColors.other
                    }`}
                  >
                    {entry.category}
                  </span>
                </div>
                <div className="mt-1 flex gap-3 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>{entry.time}</span>
                  {entry.quantity && <span>{entry.quantity}</span>}
                  {entry.duration && <span>{entry.duration}</span>}
                  {entry.calories && <span>{entry.calories} cal</span>}
                </div>
              </div>
              <button
                onClick={() => handleDelete(entry.id)}
                disabled={deletingId === entry.id}
                className="shrink-0 rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors disabled:opacity-50"
                title="Delete entry"
              >
                {deletingId === entry.id ? (
                  <span className="text-xs">...</span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
