import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import { SIGNS, type SignId } from "@/components/stroke/signs";
import { SignVisual } from "@/components/stroke/sign-visual";
import { Countdown } from "@/components/stroke/countdown";
import { HospitalUpdateForm } from "@/components/stroke/hospital-update-form";
import { ReviewForm } from "@/components/stroke/review-form";
import type { Answer, Lang, Phase, Session } from "@/components/stroke/session";

const TAP = "transition-transform duration-150 ease-out active:not-disabled:scale-[0.96]";

const PRESETS = [
  { label: "Just now", labelTa: "இப்போது", minutes: 0 },
  { label: "15 min", labelTa: "15 நிமி", minutes: 15 },
  { label: "30 min", labelTa: "30 நிமி", minutes: 30 },
  { label: "1 hour", labelTa: "1 மணி", minutes: 60 },
  { label: "2 hours", labelTa: "2 மணி", minutes: 120 },
  { label: "3 hours", labelTa: "3 மணி", minutes: 180 },
];

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function Rail({
  answers,
  current,
  onTime,
  lang,
}: {
  answers: Session["answers"];
  current: number;
  onTime: boolean;
  lang: Lang | null;
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
              active && "bg-[#1b4fad] text-white",
              !active && answer === "yes" && "bg-signal text-white",
              !active && answer === "unsure" && "bg-late-soft text-late-ink",
              !active && answer === "no" && "bg-ok-soft text-ok",
              !active && !answer && "bg-paper-deep text-ink-soft",
            )}
            aria-current={active ? "step" : undefined}
          >
            <span className="sr-only">
              {id === "T"
                ? lang === "ta"
                  ? "நேரம்"
                  : lang === "en"
                    ? "Time"
                    : "Time, நேரம்"
                : lang === "ta"
                  ? SIGNS.find((sign) => sign.id === id)?.wordTa
                  : lang === "en"
                    ? SIGNS.find((sign) => sign.id === id)?.word
                    : `${SIGNS.find((sign) => sign.id === id)?.word}, ${SIGNS.find((sign) => sign.id === id)?.wordTa}`}
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
  lang,
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
  lang: Lang | null;
  onStart: (lang: Lang) => void;
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
        lang={lang}
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
      lang={lang}
      onAnswer={onAnswer}
      onBack={onBack}
      onSkip={onSkip}
    />
  );
}

function Intro({ onStart, onSkip }: { onStart: (lang: Lang) => void; onSkip: () => void }) {
  return (
    <div className="rise mx-auto flex min-h-[70vh] max-w-md flex-col px-4 py-6">
      <div className="flex flex-1 flex-col justify-center">
      <h1 className="font-display text-5xl leading-none text-ink">Is this a stroke?</h1>
      <p className="font-tamil mt-2 text-2xl text-signal">இது பக்கவாதமா?</p>
      <p className="mt-3 text-base font-semibold text-ink">
        Time is brain. <span className="font-tamil font-medium">நேரமே மூளை.</span>
      </p>
      <ul className="mt-6 flex flex-col gap-1.5" aria-label="BEFAST">
        {[
          ...SIGNS.map((sign) => ({ letter: sign.id, en: sign.word, ta: sign.wordTa })),
          { letter: "T", en: "Time", ta: "நேரம்" },
        ].map((step) => (
          <li key={step.letter} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                step.letter === "T" ? "bg-signal" : "bg-[#1b4fad]",
              )}
            >
              {step.letter}
            </span>
            <span className="w-20 shrink-0 text-sm font-semibold text-ink">{step.en}</span>
            <span className="font-tamil text-sm text-ink-soft">{step.ta}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onStart("en")}
          className={cn(
            "flex min-h-16 flex-col items-center justify-center rounded-full bg-[#1b4fad] px-2 py-2 text-white",
            TAP,
          )}
        >
          <span className="text-base font-semibold">English</span>
          <span className="text-xs font-medium">Start the check</span>
        </button>
        <button
          type="button"
          onClick={() => onStart("ta")}
          className={cn(
            "flex min-h-16 flex-col items-center justify-center rounded-full bg-signal px-2 py-2 text-white",
            TAP,
          )}
        >
          <span className="font-tamil text-base font-semibold">தமிழ்</span>
          <span className="font-tamil text-xs font-medium">சோதனையைத் தொடங்கு</span>
        </button>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className={cn("mt-3 flex min-h-12 flex-col items-center justify-center text-ink-soft", TAP)}
      >
        <span className="text-sm font-semibold">Skip to hospitals</span>
        <span className="font-tamil text-xs font-medium">மருத்துவமனைக்குச் செல்</span>
      </button>
      </div>
      <HospitalUpdateForm />
      <ReviewForm />
      <p className="mt-6 text-center">
        <Link to="/activity" className="text-xs font-semibold text-ink-soft">
          Stroke call activity
        </Link>
      </p>
    </div>
  );
}

function SignStep({
  sign,
  index,
  answers,
  lang,
  onAnswer,
  onBack,
  onSkip,
}: {
  sign: (typeof SIGNS)[number];
  index: number;
  answers: Session["answers"];
  lang: Lang | null;
  onAnswer: (id: SignId, answer: Answer) => void;
  onBack: () => void;
  onSkip: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, [sign.id]);
  const tamil = lang === "ta";

  return (
    <div key={sign.id} className="rise mx-auto max-w-md px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className={cn("inline-flex h-11 items-center gap-1 text-sm font-semibold text-ink", TAP)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {tamil ? (
            <span className="font-tamil">பின்</span>
          ) : (
            <span>
              Back
              {lang == null ? <span className="font-tamil block text-xs font-medium">பின்</span> : null}
            </span>
          )}
        </button>
        <p className={cn("text-right text-sm font-semibold text-ink-soft", tamil && "font-tamil text-ink")}>
          {tamil ? (
            <>
              {index + 1} / 6 · {sign.wordTa}
            </>
          ) : (
            <>
              {index + 1} of 6 · {sign.word}
              {lang == null ? <span className="font-tamil block text-ink">{sign.wordTa}</span> : null}
            </>
          )}
        </p>
      </div>
      <Rail answers={answers} current={index} onTime={false} lang={lang} />
      <div className="mt-4">
        <SignVisual sign={sign} lang={lang} />
      </div>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={cn(
          "mt-5 text-3xl leading-tight outline-none",
          tamil ? "font-tamil font-semibold" : "font-display",
        )}
      >
        {tamil ? sign.askTa : sign.ask}
      </h1>
      {lang == null ? <p className="font-tamil mt-2 text-xl leading-snug text-ink">{sign.askTa}</p> : null}
      {tamil ? (
        <p className="font-tamil mt-2 text-base leading-snug text-ink-soft">{sign.helpTa}</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-ink-soft">{sign.help}</p>
          {lang == null ? (
            <p className="font-tamil mt-1 text-base leading-snug text-ink">{sign.helpTa}</p>
          ) : null}
        </>
      )}
      <div className="mt-5 grid gap-2">
        <button
          type="button"
          onClick={() => onAnswer(sign.id, "yes")}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center rounded-full bg-signal py-2 text-white",
            TAP,
          )}
        >
          {tamil ? (
            <span className="font-tamil text-base font-semibold">ஆம், இது தெரிகிறது</span>
          ) : (
            <>
              <span className="text-base font-semibold">Yes, I see this</span>
              {lang == null ? <span className="font-tamil text-sm font-medium">ஆம், இது தெரிகிறது</span> : null}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => onAnswer(sign.id, "no")}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center rounded-full border border-line bg-surface py-2 text-ink",
            TAP,
          )}
        >
          {tamil ? (
            <span className="font-tamil text-base font-semibold">இல்லை</span>
          ) : (
            <>
              <span className="text-base font-semibold">No</span>
              {lang == null ? <span className="font-tamil text-sm font-medium">இல்லை</span> : null}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => onAnswer(sign.id, "unsure")}
          className={cn("flex min-h-12 flex-col items-center justify-center text-ink-soft", TAP)}
        >
          {tamil ? (
            <span className="font-tamil text-sm font-semibold">தெரியவில்லை</span>
          ) : (
            <>
              <span className="text-sm font-semibold">Not sure</span>
              {lang == null ? <span className="font-tamil text-xs font-medium">தெரியவில்லை</span> : null}
            </>
          )}
        </button>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="mt-2 flex min-h-11 w-full flex-col items-center justify-center text-ink-soft"
      >
        {tamil ? (
          <span className="font-tamil text-sm font-semibold">மருத்துவமனைக்குச் செல்</span>
        ) : (
          <>
            <span className="text-sm font-semibold">Skip to hospitals</span>
            {lang == null ? <span className="font-tamil text-xs font-medium">மருத்துவமனைக்குச் செல்</span> : null}
          </>
        )}
      </button>
    </div>
  );
}

function TimeStep({
  onsetIso,
  timeReturn,
  answers,
  lang,
  onBack,
  onSetOnset,
  onContinue,
}: {
  onsetIso: string | null;
  timeReturn: Session["timeReturn"];
  answers: Session["answers"];
  lang: Lang | null;
  onBack: () => void;
  onSetOnset: (iso: string | null) => void;
  onContinue: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const fieldId = useId();
  const [preset, setPreset] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const tamil = lang === "ta";

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
          {tamil ? (
            <span className="font-tamil">{timeReturn === "locator" ? "மருத்துவமனை" : "பின்"}</span>
          ) : (
            <span>
              {timeReturn === "locator" ? "Hospitals" : "Back"}
              {lang == null ? (
                <span className="font-tamil block text-xs font-medium">
                  {timeReturn === "locator" ? "மருத்துவமனை" : "பின்"}
                </span>
              ) : null}
            </span>
          )}
        </button>
        <p className={cn("text-right text-sm font-semibold text-ink-soft", tamil && "font-tamil text-ink")}>
          {tamil ? (
            "6 / 6 · நேரம்"
          ) : (
            <>
              6 of 6 · Time
              {lang == null ? <span className="font-tamil block text-ink">நேரம்</span> : null}
            </>
          )}
        </p>
      </div>
      <Rail answers={answers} current={5} onTime lang={lang} />
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={cn(
          "mt-5 text-3xl leading-tight outline-none",
          tamil ? "font-tamil font-semibold" : "font-display",
        )}
      >
        {tamil
          ? "இது எப்போது தொடங்கியது? அல்லது கடைசியாக எப்போது நன்றாக இருந்தார்கள்?"
          : "When did this start — or when were they last seen well?"}
      </h1>
      {lang == null ? (
        <p className="font-tamil mt-2 text-xl leading-snug text-ink">
          இது எப்போது தொடங்கியது? அல்லது கடைசியாக எப்போது நன்றாக இருந்தார்கள்?
        </p>
      ) : null}
      {onsetIso ? (
        <div className="mt-4">
          <Countdown onsetIso={onsetIso} compact lang={lang} />
        </div>
      ) : null}
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
              preset === item.minutes ? "bg-[#1b4fad] text-white" : "bg-paper-deep text-ink",
            )}
          >
            <span className={tamil ? "font-tamil" : undefined}>{tamil ? item.labelTa : item.label}</span>
            {lang == null ? <span className="font-tamil text-xs font-medium">{item.labelTa}</span> : null}
          </button>
        ))}
      </div>
      <label htmlFor={fieldId} className={cn("mt-4 block text-sm font-semibold text-ink", tamil && "font-tamil text-base")}>
        {tamil ? "அல்லது சரியான நேரம்" : "Or set the exact time"}
        {lang == null ? (
          <span className="font-tamil mt-0.5 block text-base font-medium">அல்லது சரியான நேரம்</span>
        ) : null}
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
            setError(
              tamil
                ? "அந்த நேரம் இன்னும் வரவில்லை."
                : lang == null
                  ? "That time is in the future. அந்த நேரம் இன்னும் வரவில்லை."
                  : "That time is in the future.",
            );
            return;
          }
          setError(null);
          setPreset(null);
          onSetOnset(date.toISOString());
        }}
        className="mt-2 h-12 w-full rounded-card border border-line bg-surface px-3 text-base text-ink"
      />
      {error ? (
        <p className={cn("mt-2 text-sm font-semibold text-signal", tamil && "font-tamil")}>{error}</p>
      ) : null}
      <button
        type="button"
        onClick={onContinue}
        className={cn(
          "mt-5 flex min-h-14 w-full flex-col items-center justify-center rounded-full bg-[#1b4fad] py-2 text-white",
          TAP,
        )}
      >
        <span className={cn("text-base font-semibold", tamil && "font-tamil")}>
          {tamil
            ? onsetIso
              ? "மருத்துவமனைகளைக் காட்டு"
              : "நேரம் இல்லாமல் தொடரவும்"
            : onsetIso
              ? "Show hospitals"
              : "Continue without a time"}
        </span>
        {lang == null ? (
          <span className="font-tamil text-sm font-medium">
            {onsetIso ? "மருத்துவமனைகளைக் காட்டு" : "நேரம் இல்லாமல் தொடரவும்"}
          </span>
        ) : null}
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
        {tamil ? (
          <span className="font-tamil text-sm font-semibold">நேரம் தெரியவில்லை</span>
        ) : (
          <>
            <span className="text-sm font-semibold">I don’t know the time</span>
            {lang == null ? <span className="font-tamil text-xs font-medium">நேரம் தெரியவில்லை</span> : null}
          </>
        )}
      </button>
    </div>
  );
}
