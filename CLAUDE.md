# Energetic - Energy Tracking App

## Overview
A personal energy tracking web app with voice recognition. Users speak natural language entries throughout the day (food, water, exercise, etc.), which get parsed into structured data and stored. At end of day, user rates energy 1-10. Over time, the app reveals correlations between habits and energy levels.

## Tech Stack
- **Frontend**: Next.js (React) with TypeScript
- **Voice Input**: Web Speech API (browser-native, free)
- **NLP Parsing**: Claude API (parses natural language into structured entries)
- **Database**: Supabase (Postgres + Auth + free tier)
- **Deployment**: Vercel (later)

## Data Flow
```
Voice → Web Speech API → raw text
  → Claude API parses into structured entry
  → Stored in Supabase
  → Daily energy rating added at end of day
  → Analytics correlate habits with energy
```

## Database Schema

### entries
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- date (date)
- time (time)
- category (text) — "food", "hydration", "exercise", "sleep", "supplement", "other"
- item (text) — e.g. "PB&J sandwich", "water", "basketball"
- quantity (text, nullable) — e.g. "800ml", "2 cups"
- duration (text, nullable) — e.g. "2 hours"
- calories (integer, nullable) — estimated if possible
- raw_text (text) — original voice input
- created_at (timestamptz)

### daily_ratings
- id (uuid, primary key)
- user_id (uuid, references auth.users)
- date (date, unique per user)
- energy_rating (integer, 1-10)
- notes (text, nullable)
- created_at (timestamptz)

## Key Features (Build Order)
1. Voice input with Web Speech API
2. Claude API parsing of natural language → structured data
3. Supabase storage of entries
4. Daily energy rating input
5. Daily log view (timeline of entries)
6. Analytics dashboard (correlations between habits and energy)

## Project Structure
```
energetic/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/              # Utilities (supabase client, claude parsing)
│   └── types/            # TypeScript types
├── supabase/
│   └── migrations/       # SQL migrations
├── .env.local            # API keys (NEVER commit)
└── package.json
```

## Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```
