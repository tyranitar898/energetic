"use client";

import { useState, useRef, useCallback } from "react";

interface VoiceInputProps {
  onEntryAdded: () => void;
}

const TIME_PATTERN = /\d{1,2}[\s:]?\d{0,2}\s*(?:am|pm|a\.m\.|p\.m\.)/i;
const RELATIVE_TIME_PATTERN = /\b(?:morning|afternoon|evening|night|noon|midnight|just now|earlier|ago)\b/i;

function hasTimeReference(text: string): boolean {
  return TIME_PATTERN.test(text) || RELATIVE_TIME_PATTERN.test(text);
}

export default function VoiceInput({ onEntryAdded }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [image, setImage] = useState<{ base64: string; mimeType: string; name: string } | null>(null);
  const [timeWarningDismissed, setTimeWarningDismissed] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
      setTimeWarningDismissed(false);
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatus("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus("Image must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setImage({ base64, mimeType: file.type, name: file.name });
      setStatus("");
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const showTimeWarning = transcript.trim() && !hasTimeReference(transcript) && !timeWarningDismissed;

  const submitEntry = async () => {
    if (!transcript.trim()) return;

    if (showTimeWarning) {
      setTimeWarningDismissed(true);
      return;
    }

    setIsProcessing(true);
    setStatus("Parsing with AI...");

    try {
      const parseBody: Record<string, string> = { text: transcript };
      if (image) {
        parseBody.image = image.base64;
        parseBody.image_mime_type = image.mimeType;
      }

      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parseBody),
      });

      if (!parseRes.ok) throw new Error("Failed to parse");
      const parsed = await parseRes.json();

      setStatus("Saving...");

      const entryRes = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed, raw_text: transcript }),
      });

      if (!entryRes.ok) throw new Error("Failed to save");

      setStatus("Saved!");
      setTranscript("");
      setImage(null);
      setTimeWarningDismissed(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="flex items-center gap-2 rounded-full border border-zinc-300 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
        >
          <CameraIcon />
          Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {image && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800">
          <span className="text-sm text-zinc-600 dark:text-zinc-400 truncate flex-1">
            {image.name}
          </span>
          <button
            onClick={removeImage}
            className="shrink-0 rounded p-1 text-zinc-400 hover:text-red-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="flex gap-2">
        <input
          type="text"
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            setTimeWarningDismissed(false);
          }}
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

      {showTimeWarning && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-800 dark:bg-amber-950">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            No time detected. Add a time (e.g. &quot;at 2pm&quot;) for better tracking, or press <strong>Add</strong> again to use the current time.
          </p>
        </div>
      )}

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

function CameraIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}
