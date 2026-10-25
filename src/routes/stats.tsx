import { useCallback, useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HOSPITALS } from "@/data/hospitals";
import { seoHead } from "@/lib/seo";
import type { CounterStats } from "@/lib/counter.server";

export const Route = createFileRoute("/stats")({
  head: () =>
    seoHead({
      title: "Site stats",
      description: "Private visit and click counts.",
      path: "/stats",
      noindex: true,
    }),
  component: StatsPage,
});

const STORE_KEY = "stats-key";
const NAMES = new Map(HOSPITALS.map((hospital) => [hospital.id, hospital.name]));
const WINDOWS: [string, string][] = [
  ["green", "Within 4.5 hours"],
  ["orange", "4.5–9 hours"],
  ["past", "Past 9 hours"],
  ["unset", "Clock not set"],
  ["future", "Time not valid"],
];

function savedKey() {
  // In the URL hash (#key=…), which browsers never send to a server.
  const fromHash = new URLSearchParams(window.location.hash.slice(1)).get("key");
  if (fromHash) return fromHash;
  try {
    return sessionStorage.getItem(STORE_KEY) ?? "";
  } catch {
    return "";
  }
}

function lastDays(count: number) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" });
  const day = 24 * 60 * 60 * 1000;
  return Array.from({ length: count }, (_, i) => fmt.format(new Date(Date.now() - i * day)));
}

function label(date: string) {
  return new Date(`${date}T00:00:00+05:30`).toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

const n = (value: number | undefined) => (value ?? 0).toLocaleString("en-IN");

function StatsPage() {
  const [key, setKey] = useState("");
  const [draft, setDraft] = useState("");
  const [stats, setStats] = useState<CounterStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (candidate: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/stats", {
        headers: { "x-stats-key": candidate },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (response.status === 404) {
        setError("That key didn't work.");
        return;
      }
      if (!response.ok) throw new Error();
      setStats((await response.json()) as CounterStats);
      setKey(candidate);
      try {
        sessionStorage.setItem(STORE_KEY, candidate);
      } catch {
        // Private mode: the key just won't survive a reload.
      }
    } catch {
      setError("Couldn't load the counts. Try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = savedKey();
    if (saved) void load(saved);
  }, [load]);

  function unlock(event: FormEvent) {
    event.preventDefault();
    if (draft.trim()) void load(draft.trim());
  }

  if (!key || !stats) {
    return (
      <main className="mx-auto min-h-screen max-w-sm px-4 py-10">
        <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto" />
        <h1 className="font-display mt-6 text-3xl leading-tight">Site stats</h1>
        <form className="mt-5 grid gap-3" onSubmit={unlock}>
          <input
            type="password"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Stats key"
            autoComplete="off"
            className="h-11 rounded-full border border-line bg-surface px-4 text-base"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-11 rounded-full bg-[#1b4fad] text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Opening…" : "Open stats"}
          </button>
          {error ? (
            <p className="text-sm font-semibold text-signal" role="alert">
              {error}
            </p>
          ) : null}
        </form>
      </main>
    );
  }

  const days = lastDays(30);
  const today = days[0];
  const hospitals = [...new Set([...Object.keys(stats.call), ...Object.keys(stats.directions)])]
    .filter((field) => field.startsWith("h:"))
    .map((field) => ({
      id: field.slice(2),
      call: stats.call[field] ?? 0,
      directions: stats.directions[field] ?? 0,
    }))
    .sort((a, b) => b.call + b.directions - (a.call + a.directions));

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <img src="/brand/arunai.png" alt="Arunai Neuro Foundation" className="h-8 w-auto" />
          <h1 className="font-display mt-4 text-3xl leading-tight">Site stats</h1>
          <p className="mt-1 text-sm text-ink-soft">Days are India time. A visit is one browser session.</p>
        </div>
        <button
          type="button"
          onClick={() => void load(key)}
          disabled={loading}
          className="h-10 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {!stats.connected ? (
        <p className="mt-6 rounded-card border border-line bg-surface px-4 py-4 text-sm text-ink" role="status">
          Counters aren&rsquo;t connected yet. Add Upstash Redis in Vercel → Storage, connect it to this project, then
          redeploy.
        </p>
      ) : null}

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat title="Visits" value={n(stats.visits.total)} note={`${n(stats.visits[`d:${today}`])} today`} />
        <Stat title="Call taps" value={n(stats.call.total)} note={`${n(stats.call[`d:${today}`])} today`} />
        <Stat title="Directions taps" value={n(stats.directions.total)} note={`${n(stats.directions[`d:${today}`])} today`} />
        <Stat title="Calls to 108" value={n(stats.call.to108)} note="part of call taps" />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Last 30 days</h2>
        <div className="mt-2 overflow-x-auto rounded-card border border-line bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-paper-deep text-left text-xs text-ink-soft">
              <tr>
                <th className="px-3 py-2 font-semibold">Day</th>
                <th className="px-3 py-2 text-right font-semibold">Visits</th>
                <th className="px-3 py-2 text-right font-semibold">Calls</th>
                <th className="px-3 py-2 text-right font-semibold">Directions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line tabular-nums">
              {days.map((day) => (
                <tr key={day}>
                  <td className="px-3 py-1.5">{label(day)}</td>
                  <td className="px-3 py-1.5 text-right">{n(stats.visits[`d:${day}`])}</td>
                  <td className="px-3 py-1.5 text-right">{n(stats.call[`d:${day}`])}</td>
                  <td className="px-3 py-1.5 text-right">{n(stats.directions[`d:${day}`])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">By hospital</h2>
        {hospitals.length === 0 ? (
          <p className="mt-2 text-sm text-ink-soft">No Call or Directions taps yet.</p>
        ) : (
          <div className="mt-2 overflow-x-auto rounded-card border border-line bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-paper-deep text-left text-xs text-ink-soft">
                <tr>
                  <th className="px-3 py-2 font-semibold">Hospital</th>
                  <th className="px-3 py-2 text-right font-semibold">Calls</th>
                  <th className="px-3 py-2 text-right font-semibold">Directions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {hospitals.map((row) => (
                  <tr key={row.id}>
                    <td className="px-3 py-1.5">{NAMES.get(row.id) ?? row.id}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{n(row.call)}</td>
                    <td className="px-3 py-1.5 text-right tabular-nums">{n(row.directions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 mb-10">
        <h2 className="text-lg font-semibold">Call taps by stroke clock</h2>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {WINDOWS.map(([id, text]) => (
            <li key={id} className="flex items-center justify-between rounded-card border border-line bg-surface px-4 py-2.5 text-sm">
              <span>{text}</span>
              <span className="font-semibold tabular-nums">{n(stats.call[`w:${id}`])}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Stat({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="rounded-card border border-line bg-surface px-4 py-3">
      <p className="text-xs font-semibold text-ink-soft">{title}</p>
      <p className="font-display mt-1 text-3xl tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-ink-soft">{note}</p>
    </div>
  );
}
