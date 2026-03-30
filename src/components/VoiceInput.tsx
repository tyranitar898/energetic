"use client";

import { useState, useRef, useCallback } from "react";

interface VoiceInputProps {
  onEntryAdded: () => void;
  userId: string | null;
}

export default function VoiceInput({ onEntryAdded, userId }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("Speech recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const current = event.results[event.results.length - 1];
      setTranscript(current[0].transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setStatus(`Error: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setStatus("Listening...");
    setTranscript("");
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const submitEntry = async () => {
    if (!transcript.trim()) return;

    setIsProcessing(true);
    setStatus("Parsing with AI...");

    try {
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript }),
      });

      if (!parseRes.ok) throw new Error("Failed to parse");
      const parsed = await parseRes.json();

      setStatus("Saving...");

      const entryRes = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed, raw_text: transcript, user_id: userId }),
      });

      if (!entryRes.ok) throw new Error("Failed to save");

      setStatus("Saved!");
      setTranscript("");
      onEntryAdded();

      setTimeout(() => setStatus(""), 2000);
    } catch {
      setStatus("Error saving entry. Check your API keys and Supabase setup.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitEntry();
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="mb-4 text-lg font-semibold">Log Entry</h2>

      <div className="flex gap-3 mb-4">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-medium text-white transition-all ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-blue-500 hover:bg-blue-600"
          } disabled:opacity-50`}
        >
          {isListening ? (
            <>
              <MicOff /> Stop
            </>
          ) : (
            <>
              <Mic /> Speak
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          type="text"
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Or type: I had a PB&J sandwich at 9am..."
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
        />
        <button
          type="submit"
          disabled={!transcript.trim() || isProcessing}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {isProcessing ? "..." : "Add"}
        </button>
      </form>

      {status && (
        <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          {status}
        </p>
      )}
    </div>
  );
}

function Mic() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" x2="12" y1="19" y2="22" />
    </svg>
  );
}

function MicOff() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="12" rx="3" />
      <line x1="8" x2="8" y1="18" y2="22" />
      <line x1="16" x2="16" y1="18" y2="22" />
    </svg>
  );
}
