import { useEffect, useId, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { SIGNS, type SignId } from "@/components/stroke/signs";
import { SignVisual } from "@/components/stroke/sign-visual";
import { Countdown } from "@/components/stroke/countdown";
import type { Answer, Phase, Session } from "@/components/stroke/session";

const TAP = "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]";

const PRESETS = [
  { label: "Just now", labelTa: "இப்போது", minutes: 0 },
  { label: "15 min", labelTa: "15 நிமி", minutes: 15 },
  { label: "30 min", labelTa: "30 நிமி", minutes: 30 },
  { label: "1 hour", labelTa: "1 மணி", minutes: 60 },
  { label: "2 hours", labelTa: "2 மணி", minutes: 120 },
  { label: "3 hours", labelTa: "3 மணி", minutes: 180 },
  { label: "4 hours", labelTa: "4 மணி", minutes: 240 },
  { label: "6 hours", labelTa: "6 மணி", minutes: 360 },
  { label: "8 hours", labelTa: "8 மணி", minutes: 480 },
];

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Rail({
  answers,
  current,
  onTime,
}: {
  answers: Session["answers"];
  current: number;
  onTime: boolean;
}) {
  const steps = [...SIGNS.map((sign) => sign.id), "T" as const];
  return (
    <ol className="grid grid-cols-6 gap-1.5" aria-label="BEFAST progress">
      {steps.map((id, index) => {
        const answer = id === "T" ? null : answers[id];
        const active = onTime ? id === "T" : index === current;
        return (
          <li
            key={id}
            className={cn(
              "flex h-10 items-center justify-center rounded-full text-sm font-semibold",
              active && "bg-[#f4efe6] text-[#071018]",
              !active && answer === "yes" && "bg-signal text-ink",
              !active && answer === "unsure" && "bg-late-soft text-late-ink",
              !active && answer === "no" && "bg-ok-soft text-ok",
              !active && !answer && "bg-paper-deep text-ink-soft",
            )}
            aria-current={active ? "step" : undefined}
          >
            <span className="sr-only">
              {id === "T" ? "Time, நேரம்" : `${SIGNS.find((sign) => sign.id === id)?.word}, ${SIGNS.find((sign) => sign.id === id)?.wordTa}`}
              {answer ? `, ${answer}` : ""}
            </span>
            <span aria-hidden="true">{id}</span>
          </li>
        );
      })}
    </ol>
  );
}

export function Flow({
  phase,
  signIndex,
  answers,
  onsetIso,
  timeReturn,
  onStart,
  onSkip,
  onAnswer,
  onBack,
  onSetOnset,
  onContinue,
}: {
  phase: Phase;
  signIndex: number;
  answers: Session["answers"];
  onsetIso: string | null;
  timeReturn: Session["timeReturn"];
  onStart: () => void;
  onSkip: () => void;
  onAnswer: (id: SignId, answer: Answer) => void;
  onBack: () => void;
  onSetOnset: (iso: string | null) => void;
  onContinue: () => void;
}) {
  if (phase === "intro") {
    return (
      <Intro onStart={onStart} onSkip={onSkip} />
    );
  }
  if (phase === "time") {
    return (
      <TimeStep
        onsetIso={onsetIso}
        timeReturn={timeReturn}
        answers={answers}
        onBack={onBack}
        onSetOnset={onSetOnset}
        onContinue={onContinue}
      />
    );
  }
  const sign = SIGNS[signIndex] ?? SIGNS[0];
  return (
    <SignStep
      sign={sign}
      index={signIndex}
      answers={answers}
      onAnswer={onAnswer}
      onBack={onBack}
      onSkip={onSkip}
    />
  );
}

function Intro({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <div className="rise mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-6">
      <h1 className="font-display text-5xl leading-none text-ink">Is this a stroke?</h1>
      <p className="font-tamil mt-2 text-2xl text-signal">இது பக்கவாதமா?</p>
      <p className="mt-3 text-base font-semibold text-ink">
        Time is brain. <span className="font-tamil font-medium">நேரமே மூளை.</span>
      </p>
      <ol className="mt-6 grid grid-cols-6 gap-1.5" aria-label="BEFAST">
        {[
          ...SIGNS.map((sign) => ({ letter: sign.id, ta: sign.wordTa })),
          { letter: "T", ta: "நேரம்" },
        ].map((step) => (
          <li key={step.letter} className="text-center">
            <span
              className={cn(
                "rise flex h-12 items-center justify-center rounded-full font-display text-lg",
                step.letter === "T" ? "bg-signal text-ink" : "bg-[#f4efe6] text-[#071018]",
              )}
              style={{ animationDelay: `${"BEFAST".indexOf(step.letter) * 60}ms` }}
            >
              {step.letter}
            </span>
            <span className="font-tamil mt-1 block text-xs leading-tight font-semibold text-ink">{step.ta}</span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onStart}
        className={cn(
          "mt-8 flex min-h-14 flex-col items-center justify-center rounded-full bg-signal px-4 py-2 text-ink",
          TAP,
        )}
      >
        <span className="text-base font-semibold">Start the check</span>
        <span className="font-tamil text-sm font-medium">சோதனையைத் தொடங்கு</span>
      </button>
      <button
        type="button"
        onClick={onSkip}
        className={cn("mt-3 flex min-h-12 flex-col items-center justify-center text-ink-soft", TAP)}
      >
        <span className="text-sm font-semibold">Skip to hospitals</span>
        <span className="font-tamil text-xs font-medium">மருத்துவமனைக்குச் செல்</span>
      </button>
    </div>
  );
}

function SignStep({
  sign,
  index,
  answers,
  onAnswer,
  onBack,
  onSkip,
}: {
  sign: (typeof SIGNS)[number];
  index: number;
  answers: Session["answers"];
  onAnswer: (id: SignId, answer: Answer) => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [sign.id]);

  return (
    <div key={sign.id} className="rise mx-auto max-w-md px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className={cn("inline-flex h-11 items-center gap-1 text-sm font-semibold text-ink", TAP)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span>
            Back
            <span className="font-tamil block text-xs font-medium">பின்</span>
          </span>
        </button>
        <p className="text-right text-sm font-semibold text-ink-soft">
          {index + 1} of 6 · {sign.word}
          <span className="font-tamil block text-ink">{sign.wordTa}</span>
        </p>
      </div>
      <Rail answers={answers} current={index} onTime={false} />
      <div className="mt-4">
        <SignVisual sign={sign} />
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 font-display text-3xl leading-tight outline-none"
      >
        {sign.ask}
      </h1>
      <p className="font-tamil mt-2 text-xl leading-snug text-ink">{sign.askTa}</p>
      <p className="mt-2 text-sm text-ink-soft">{sign.help}</p>
      <p className="font-tamil mt-1 text-base leading-snug text-ink">{sign.helpTa}</p>
      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={() => onAnswer(sign.id, "yes")}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center rounded-full bg-signal py-2 text-ink",
            TAP,
          )}
        >
          <span className="text-base font-semibold">Yes, I see this</span>
          <span className="font-tamil text-sm font-medium">ஆம், இது தெரிகிறது</span>
        </button>
        <button
          type="button"
          onClick={() => onAnswer(sign.id, "no")}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center rounded-full border border-line bg-surface py-2 text-ink",
            TAP,
          )}
        >
          <span className="text-base font-semibold">No</span>
          <span className="font-tamil text-sm font-medium">இல்லை</span>
        </button>
        <button
          type="button"
          onClick={() => onAnswer(sign.id, "unsure")}
          className={cn("flex min-h-12 flex-col items-center justify-center text-ink-soft", TAP)}
        >
          <span className="text-sm font-semibold">Not sure</span>
          <span className="font-tamil text-xs font-medium">தெரியவில்லை</span>
        </button>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-2 flex min-h-11 w-full flex-col items-center justify-center text-ink-soft"
      >
        <span className="text-sm font-semibold">Skip to hospitals</span>
        <span className="font-tamil text-xs font-medium">மருத்துவமனைக்குச் செல்</span>
      </button>
    </div>
  );
}

function TimeStep({
  onsetIso,
  timeReturn,
  answers,
  onBack,
  onSetOnset,
  onContinue,
}: {
  onsetIso: string | null;
  timeReturn: Session["timeReturn"];
  answers: Session["answers"];
  onBack: () => void;
  onSetOnset: (iso: string | null) => void;
  onContinue: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fieldId = useId();
  const [preset, setPreset] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="rise mx-auto max-w-md px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className={cn("inline-flex h-11 items-center gap-1 text-sm font-semibold text-ink", TAP)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          <span>
            {timeReturn === "locator" ? "Hospitals" : "Back"}
            <span className="font-tamil block text-xs font-medium">
              {timeReturn === "locator" ? "மருத்துவமனை" : "பின்"}
            </span>
          </span>
        </button>
        <p className="text-right text-sm font-semibold text-ink-soft">
          6 of 6 · Time
          <span className="font-tamil block text-ink">நேரம்</span>
        </p>
      </div>
      <Rail answers={answers} current={5} onTime />
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 font-display text-3xl leading-tight outline-none"
      >
        When did this start — or when were they last seen well?
      </h1>
      <p className="font-tamil mt-2 text-xl leading-snug text-ink">
        இது எப்போது தொடங்கியது? அல்லது கடைசியாக எப்போது நன்றாக இருந்தார்கள்?
      </p>
      <div className="mt-4">
        <Countdown onsetIso={onsetIso} compact />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {PRESETS.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={preset === item.minutes}
            onClick={() => {
              setPreset(item.minutes);
              setError(null);
              onSetOnset(new Date(Date.now() - item.minutes * 60 * 1000).toISOString());
            }}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center rounded-full px-1 py-1 text-sm leading-tight font-semibold",
              TAP,
              preset === item.minutes ? "bg-[#f4efe6] text-[#071018]" : "bg-paper-deep text-ink",
            )}
          >
            <span>{item.label}</span>
            <span className="font-tamil text-xs font-medium">{item.labelTa}</span>
          </button>
        ))}
      </div>
      <label htmlFor={fieldId} className="mt-4 block text-sm font-semibold text-ink">
        Or set the exact time
        <span className="font-tamil mt-0.5 block text-base font-medium">அல்லது சரியான நேரம்</span>
      </label>
      <input
        id={fieldId}
        type="datetime-local"
        max={toLocalInput(new Date())}
        value={onsetIso ? toLocalInput(new Date(onsetIso)) : ""}
        onChange={(event) => {
          const value = event.target.value;
          if (!value) return;
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return;
          if (date.getTime() > Date.now() + 60_000) {
            setError("That time is in the future. அந்த நேரம் இன்னும் வரவில்லை.");
            return;
          }
          setError(null);
          setPreset(null);
          onSetOnset(date.toISOString());
        }}
        className="mt-2 h-12 w-full rounded-card border border-line bg-surface px-3 text-base text-ink"
      />
      {error ? <p className="mt-2 text-sm font-semibold text-signal">{error}</p> : null}
      <button
        type="button"
        onClick={onContinue}
        className={cn(
          "mt-5 flex min-h-14 w-full flex-col items-center justify-center rounded-full bg-[#f4efe6] py-2 text-[#071018]",
          TAP,
        )}
      >
        <span className="text-base font-semibold">
          {onsetIso ? "Show hospitals" : "Continue without a time"}
        </span>
        <span className="font-tamil text-sm font-medium">
          {onsetIso ? "மருத்துவமனைகளைக் காட்டு" : "நேரம் இல்லாமல் தொடரவும்"}
        </span>
      </button>
      <button
        type="button"
        onClick={() => {
          setPreset(null);
          setError(null);
          onSetOnset(null);
          onContinue();
        }}
        className="mt-2 flex min-h-11 w-full flex-col items-center justify-center text-ink-soft"
      >
        <span className="text-sm font-semibold">I don’t know the time</span>
        <span className="font-tamil text-xs font-medium">நேரம் தெரியவில்லை</span>
      </button>
    </div>
  );
}
