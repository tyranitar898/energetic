"use client";

import { useState } from "react";

interface EnergyRatingProps {
  currentRating: number | null;
  currentSleepRating: number | null;
  onRatingSaved: () => void;
  userId: string | null;
}

export default function EnergyRating({
  currentRating,
  currentSleepRating,
  onRatingSaved,
  userId,
}: EnergyRatingProps) {
  const [energyRating, setEnergyRating] = useState<number>(currentRating || 5);
  const [sleepRating, setSleepRating] = useState<number>(currentSleepRating || 5);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          energy_rating: energyRating,
          sleep_rating: sleepRating,
          notes,
          user_id: userId,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setSaved(true);
      onRatingSaved();
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error("Failed to save rating:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold">Daily Ratings</h2>

      <RatingSlider
        label="Energy Level"
        value={energyRating}
        onChange={setEnergyRating}
        currentValue={currentRating}
      />

      <div className="mt-6">
        <RatingSlider
          label="Sleep Quality"
          value={sleepRating}
          onChange={setSleepRating}
          currentValue={currentSleepRating}
        />
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Optional notes about your day..."
        className="mt-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        rows={2}
      />

      <button
        onClick={handleSubmit}
        disabled={isSaving}
        className="mt-3 w-full rounded-lg bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {saved ? "Saved!" : isSaving ? "Saving..." : "Save Ratings"}
      </button>
    </div>
  );
}

function RatingSlider({
  label,
  value,
  onChange,
  currentValue,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  currentValue: number | null;
}) {
  const ratingColor = (v: number) => {
    if (v <= 3) return "bg-red-500";
    if (v <= 5) return "bg-yellow-500";
    if (v <= 7) return "bg-green-400";
    return "bg-green-500";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          {label}
          {currentValue && (
            <span className="ml-2 text-zinc-500 font-normal">
              (saved: {currentValue}/10)
            </span>
          )}
        </span>
        <span className="text-2xl font-bold">{value}</span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between mt-1">
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => onChange(i + 1)}
            className={`w-7 h-7 rounded-full text-xs font-medium text-white transition-all ${
              i + 1 === value
                ? `${ratingColor(i + 1)} scale-110 ring-2 ring-offset-2 ring-zinc-400`
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
