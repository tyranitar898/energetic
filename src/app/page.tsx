"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import VoiceInput from "@/components/VoiceInput";
import EntryList from "@/components/EntryList";
import EnergyRating from "@/components/EnergyRating";
import AllEntries from "@/components/AllEntries";
import Analysis from "@/components/Analysis";
import HowToUse from "@/components/HowToUse";
import { Entry } from "@/types";
import { createClient } from "@/lib/supabase-browser";

export default function Home() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}

const validTabs = ["today", "all", "analysis", "howto"] as const;
type Tab = (typeof validTabs)[number];

function HomeContent() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [currentRating, setCurrentRating] = useState<number | null>(null);
  const [currentSleepRating, setCurrentSleepRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const tab: Tab = validTabs.includes(tabParam as Tab) ? (tabParam as Tab) : "today";

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? null);
      setAuthChecked(true);
    });
  }, []);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/entries?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Failed to fetch entries:", error);
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  const fetchRating = useCallback(async () => {
    try {
      const res = await fetch(`/api/ratings?date=${today}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentRating(data?.energy_rating || null);
        setCurrentSleepRating(data?.sleep_rating || null);
      }
    } catch (error) {
      console.error("Failed to fetch rating:", error);
    }
  }, [today]);

  useEffect(() => {
    fetchEntries();
    fetchRating();
  }, [fetchEntries, fetchRating]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Summary stats
  const totalCalories = entries.reduce((sum, e) => sum + (e.calories || 0), 0);
  const waterEntries = entries.filter((e) => e.category === "hydration");
  const exerciseEntries = entries.filter((e) => e.category === "exercise");

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <p className="text-sm text-zinc-400">Loading...</p>
      </div>
    );
  }

  // Unauthenticated: show landing page with HowToUse
  if (!userEmail) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">Energetic</h1>
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login?signup=true"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
          <HowToUse />
        </main>
      </div>
    );
  }

  // Authenticated: show full app with tabs
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Energetic</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 hidden sm:inline">
              {userEmail}
            </span>
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto max-w-2xl px-4 flex gap-1">
          {([
            { key: "today", label: "Today" },
            { key: "all", label: "All Entries" },
            { key: "analysis", label: "Analysis" },
            { key: "howto", label: "How to Use" },
          ] as const).map(({ key, label }) => (
            <Link
              key={key}
              href={`/?tab=${key}`}
              scroll={false}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === key
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {tab === "today" ? (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-2xl font-bold">{entries.length}</p>
                <p className="text-xs text-zinc-500">Entries</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-2xl font-bold">
                  {totalCalories > 0 ? totalCalories : "-"}
                </p>
                <p className="text-xs text-zinc-500">Est. Calories</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-2xl font-bold">
                  {waterEntries.length > 0
                    ? waterEntries.length
                    : exerciseEntries.length > 0
                    ? exerciseEntries.length
                    : "-"}
                </p>
                <p className="text-xs text-zinc-500">
                  {waterEntries.length > 0 ? "Water Logs" : "Exercise"}
                </p>
              </div>
            </div>

            <VoiceInput onEntryAdded={fetchEntries} />
            <EntryList entries={entries} isLoading={isLoading} onEntryDeleted={fetchEntries} />
            <EnergyRating
              currentRating={currentRating}
              currentSleepRating={currentSleepRating}
              onRatingSaved={fetchRating}
            />
          </>
        ) : tab === "all" ? (
          <AllEntries />
        ) : tab === "analysis" ? (
          <Analysis />
        ) : (
          <HowToUse />
        )}
      </main>
    </div>
  );
}
