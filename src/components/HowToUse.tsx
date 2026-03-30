"use client";

const steps = [
  {
    number: "01",
    title: "Log throughout the day",
    description:
      "Use voice or text to record what you eat, drink, and do. Just speak naturally — say things like \"had a PB&J for lunch\" or \"drank 500ml of water.\"",
    icon: "🎙️",
    example: "\"I had two eggs and toast for breakfast\"",
  },
  {
    number: "02",
    title: "We structure it for you",
    description:
      "Your natural language gets parsed into structured data — category, quantity, calories, and more. No forms to fill out, no dropdowns to navigate.",
    icon: "🧠",
    example: "food · 2 eggs + toast · ~350 cal",
  },
  {
    number: "03",
    title: "Rate your energy at end of day",
    description:
      "Before bed, give your day an energy score from 1 to 10. Optionally rate your sleep too. This is the signal that ties everything together.",
    icon: "⚡",
    example: "Energy: 8/10 · Sleep: 7/10",
  },
  {
    number: "04",
    title: "Discover what works for you",
    description:
      "Over time, patterns emerge. See which habits correlate with high-energy days and which ones drag you down. Data-driven self-awareness.",
    icon: "📊",
    example: "High energy days → more water, morning exercise",
  },
];

const categories = [
  { icon: "🍽", label: "Food", example: "meals, snacks, coffee" },
  { icon: "💧", label: "Hydration", example: "water, tea, juice" },
  { icon: "🏃", label: "Exercise", example: "running, yoga, gym" },
  { icon: "😴", label: "Sleep", example: "naps, bedtime, wake time" },
  { icon: "💊", label: "Supplements", example: "vitamins, medication" },
  { icon: "📝", label: "Other", example: "mood, stress, notes" },
];

export default function HowToUse() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero */}
      <section className="text-center space-y-4 pt-4">
        <p className="text-4xl">⚡</p>
        <h2 className="text-2xl font-bold tracking-tight">
          Understand your energy.
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
          Energetic helps you track daily habits with your voice and discover
          what makes you feel your best. No complicated forms — just speak
          naturally.
        </p>
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
          How it works
        </span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Steps */}
      <section className="space-y-12">
        {steps.map((step) => (
          <div key={step.number} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{step.icon}</span>
              <div>
                <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                  Step {step.number}
                </span>
                <h3 className="text-lg font-semibold leading-tight">
                  {step.title}
                </h3>
              </div>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed pl-[44px]">
              {step.description}
            </p>
            <div className="ml-[44px] rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {step.example}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
          What you can track
        </span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Categories */}
      <section className="grid grid-cols-2 gap-3">
        {categories.map((cat) => (
          <div
            key={cat.label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="text-xl">{cat.icon}</span>
            <p className="mt-2 text-sm font-semibold">{cat.label}</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              {cat.example}
            </p>
          </div>
        ))}
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
          Tips
        </span>
        <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      {/* Tips */}
      <section className="space-y-4">
        {[
          {
            tip: "Be consistent",
            detail:
              "The more days you log, the better your analysis gets. Even partial days help.",
          },
          {
            tip: "Speak naturally",
            detail:
              "No need for exact formats. Say \"big glass of water\" or \"ran for 30 minutes\" — it just works.",
          },
          {
            tip: "Rate honestly",
            detail:
              "Your energy rating is personal. There are no wrong answers — just track how you actually feel.",
          },
        ].map((item) => (
          <div
            key={item.tip}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-sm font-semibold">{item.tip}</p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {item.detail}
            </p>
          </div>
        ))}
      </section>

      {/* Footer CTA */}
      <section className="text-center space-y-3 pt-4">
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          Ready to start?
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Switch to the <span className="font-medium text-zinc-600 dark:text-zinc-300">Today</span> tab and log your first entry.
        </p>
      </section>
    </div>
  );
}
