import { useEffect, useState } from "react";
import { formatHMS, fractionLeft, readClock, WINDOW_45_MS, WINDOW_9_MS } from "@/lib/clock";
import { useReduceMotion } from "@/lib/reduce-motion";
import { cn } from "@/lib/cn";
import type { Lang } from "@/components/stroke/session";

const TAP = "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]";

export function Countdown({
  onsetIso,
  onEdit,
  compact = false,
  lang = null,
}: {
  onsetIso: string | null;
  onEdit?: () => void;
  compact?: boolean;
  lang?: Lang | null;
}) {
  const reduce = useReduceMotion();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const clock = readClock(onsetIso, now);
  const showRings = clock.phase === "green" || clock.phase === "orange" || clock.phase === "past";
  const frac45 = showRings ? fractionLeft(clock.left45, WINDOW_45_MS) : 0;
  const frac9 = showRings ? fractionLeft(clock.left9, WINDOW_9_MS) : 0;
  const ring9 = 2 * Math.PI * 54;
  const ring45 = 2 * Math.PI * 40;
  const dash = reduce ? "none" : "stroke-dashoffset 1s linear";

  const hero =
    clock.phase === "green"
      ? formatHMS(clock.left45)
      : clock.phase === "orange"
        ? formatHMS(clock.left9)
        : clock.phase === "past"
          ? formatHMS(clock.elapsed)
          : "--:--:--";

  const tamil = lang === "ta";
  const heroLabel =
    clock.phase === "green"
      ? tamil
        ? "4.5 மணி நேரத்தில் மீதம்"
        : "Left in the 4.5-hour window"
      : clock.phase === "orange"
        ? tamil
          ? "9 மணி நேரத்தில் மீதம்"
          : "Left in the 9-hour window"
        : clock.phase === "past"
          ? tamil
            ? "கடைசியாக நன்றாக இருந்ததிலிருந்து"
            : "Time since last seen well"
          : tamil
            ? "கடிகாரம் தொடங்கவில்லை"
            : "Clock not started";

  const phaseSentence =
    clock.phase === "green"
      ? tamil
        ? "4.5 மணி நேரத்திற்குள். இரத்தக் கட்டியைக் கரைக்கும் மருந்துக்கு இது பெரும்பாலும் சொல்லப்படும் நேரம்."
        : "Inside the 4.5-hour window often cited for clot-busting medicine."
      : clock.phase === "orange"
        ? tamil
          ? "4.5 மணி கடந்தது. 9 மணி நேரத்திற்குள் சில மருத்துவமனைகள் இன்னும் பார்க்கும்."
          : "Past 4.5 hours. Inside the 9-hour window some hospitals still assess."
        : clock.phase === "past"
          ? tamil
            ? "இந்தக் கடிகாரத்தில் 9 மணி கடந்தது. அவசர சிகிச்சை இன்னும் உதவும்."
            : "Past 9 hours on this clock. Emergency care can still help."
          : clock.phase === "future"
            ? tamil
              ? "அந்த நேரம் இன்னும் வரவில்லை. அறிகுறி தொடங்கிய நேரத்தை, அல்லது கடைசியாக நன்றாக இருந்த நேரத்தைப் போடுங்கள்."
              : "That time is in the future. Use when symptoms began, or when the person was last seen well."
            : tamil
              ? "அறிகுறி தொடங்கிய நேரத்தை, அல்லது கடைசியாக நன்றாக இருந்த நேரத்தை அமையுங்கள்."
              : "Set the time symptoms began, or when the person was last seen well.";

  return (
    <section
      className={cn(
        "rounded-card border px-4 py-5 shadow-card",
        clock.phase === "green" && "border-ok bg-ok-soft",
        clock.phase === "orange" && "border-late bg-late-soft",
        clock.phase === "past" && "border-signal bg-signal-soft",
        (clock.phase === "unset" || clock.phase === "future") && "border-line bg-surface",
      )}
      aria-labelledby="clock-label"
    >
      <p className="sr-only" aria-live="polite">
        {phaseSentence}
      </p>
      <div className="mx-auto grid max-w-md gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className={cn("relative mx-auto", compact ? "size-36" : "size-48")} role="timer" aria-label={`${heroLabel}. ${hero}`}>
          <svg viewBox="0 0 140 140" className="size-full -rotate-90" aria-hidden="true">
            <circle cx="70" cy="70" r="54" className="fill-none stroke-line" strokeWidth="8" />
            <circle cx="70" cy="70" r="40" className="fill-none stroke-line" strokeWidth="8" />
            {showRings ? (
              <circle
                cx="70"
                cy="70"
                r="54"
                className="fill-none stroke-late"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${ring9} ${ring9}`}
                strokeDashoffset={ring9 * (1 - frac9)}
                style={{ transition: dash }}
              />
            ) : null}
            {showRings ? (
              <circle
                cx="70"
                cy="70"
                r="40"
                className="fill-none stroke-ok"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${ring45} ${ring45}`}
                strokeDashoffset={ring45 * (1 - frac45)}
                style={{ transition: dash }}
              />
            ) : null}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <p
              id="clock-label"
              className={cn(
                "font-sans text-3xl font-semibold tabular-nums tracking-tight",
                clock.phase === "green" && "text-ok",
                clock.phase === "orange" && "text-late-ink",
                clock.phase === "past" && "text-signal",
                (clock.phase === "unset" || clock.phase === "future") && "text-ink",
              )}
            >
              {hero}
            </p>
          </div>
        </div>
        <div className="text-center sm:text-left">
          <p className={cn("font-display text-2xl leading-tight", tamil && "font-tamil font-semibold")}>{heroLabel}</p>
          <p className={cn("mt-2 text-sm text-ink-soft", tamil && "font-tamil", compact && "line-clamp-3")}>{phaseSentence}</p>
          {showRings && !compact ? (
            <ul className="mt-3 space-y-1 text-sm">
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <span className="size-2.5 rounded-full bg-ok" aria-hidden="true" />
                <span className={cn("text-ok", tamil && "font-tamil")}>
                  {tamil ? "4.5 மணி" : "4.5h window"}{" "}
                  {clock.left45 > 0
                    ? tamil
                      ? `${formatHMS(clock.left45)} மீதம்`
                      : `${formatHMS(clock.left45)} left`
                    : tamil
                      ? "கடந்தது"
                      : "passed"}
                </span>
              </li>
              <li className="flex items-center justify-center gap-2 sm:justify-start">
                <span className="size-2.5 rounded-full bg-late" aria-hidden="true" />
                <span className={cn("text-late-ink", tamil && "font-tamil")}>
                  {tamil ? "9 மணி" : "9h window"}{" "}
                  {clock.left9 > 0
                    ? tamil
                      ? `${formatHMS(clock.left9)} மீதம்`
                      : `${formatHMS(clock.left9)} left`
                    : tamil
                      ? "கடந்தது"
                      : "passed"}
                </span>
              </li>
              <li className={cn("text-ink-soft tabular-nums", tamil && "font-tamil")}>
                {tamil ? `கடந்த நேரம் ${formatHMS(clock.elapsed)}` : `Elapsed ${formatHMS(clock.elapsed)}`}
              </li>
            </ul>
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              className={cn(
                "mt-4 inline-flex h-11 items-center rounded-full bg-[#1b4fad] px-4 text-sm font-semibold text-white",
                tamil && "font-tamil",
                TAP,
              )}
            >
              {tamil ? (onsetIso ? "நேரத்தை மாற்று" : "நேரத்தை அமை") : onsetIso ? "Change the time" : "Set the time"}
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
