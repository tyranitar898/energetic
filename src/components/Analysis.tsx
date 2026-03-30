"use client";

import { useState } from "react";

const timeRanges = [
  { label: "7 Days", days: 7 },
  { label: "14 Days", days: 14 },
  { label: "1 Month", days: 30 },
  { label: "3 Months", days: 90 },
];

interface Stats {
  days_analyzed: number;
  total_entries: number;
  avg_energy: string | null;
  avg_sleep: string | null;
}

export default function Analysis({ userId }: { userId: string | null }) {
  const [selectedDays, setSelectedDays] = useState(7);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setStats(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: selectedDays, user_id: userId }),
      });

      if (!res.ok) throw new Error("Failed to analyze");

      const data = await res.json();
      setAnalysis(data.analysis);
      setStats(data.stats);
    } catch {
      setError("Failed to generate analysis. Check your API keys.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold">Energy Analysis</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {timeRanges.map((range) => (
            <button
              key={range.days}
              onClick={() => setSelectedDays(range.days)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                selectedDays === range.days
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <button
          onClick={runAnalysis}
          disabled={isLoading}
          className="w-full rounded-lg bg-blue-500 py-3 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? "Analyzing..." : `Analyze Last ${selectedDays} Days`}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Days" value={stats.days_analyzed.toString()} />
          <StatCard label="Entries" value={stats.total_entries.toString()} />
          <StatCard label="Avg Energy" value={stats.avg_energy || "-"} />
          <StatCard label="Avg Sleep" value={stats.avg_sleep || "-"} />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
            <p className="text-sm text-zinc-500">
              Analyzing your patterns...
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="mb-3 font-semibold">Findings</h3>
          <div className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 whitespace-pre-line">
            {analysis}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 text-center dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
