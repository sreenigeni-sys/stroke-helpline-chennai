import { useEffect, useState } from "react";
import {
  concernOf,
  freshSession,
  type Answer,
  type Lang,
  type Session,
} from "@/components/stroke/session";
import { Flow } from "@/components/stroke/flow";
import { Locator } from "@/components/stroke/locator";
import { CallBar } from "@/components/stroke/call-bar";
import { SIGNS, type SignId } from "@/components/stroke/signs";
import { cn } from "@/lib/cn";

export function StrokeApp() {
  const [session, setSession] = useState<Session>(freshSession);

  useEffect(() => {
    document.documentElement.lang = session.lang === "ta" ? "ta" : "en";
  }, [session.lang]);

  function patch(update: (current: Session) => Session) {
    setSession((current) => update(current));
  }

  function openHospitals(update: (current: Session) => Session) {
    patch(update);
  }

  const concern = concernOf(session.answers);
  const atFinder = session.phase === "locator";
  const atIntro = session.phase === "intro";
  const tamil = session.lang === "ta";

  return (
    <>
      <main className="min-h-screen pb-24">
        <header className="mx-auto flex max-w-5xl items-start justify-between gap-3 px-4 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <img
              src="/brand/arunai.png"
              alt="Arunai Neuro Foundation"
              className="h-8 w-auto max-w-[7.5rem] shrink-0 object-contain sm:h-11 sm:max-w-[12rem]"
            />
            <div className="min-w-0">
              <p className={cn("truncate text-lg leading-tight sm:text-xl", tamil ? "font-tamil font-semibold" : "font-display")}>
                {tamil ? "சென்னை பக்கவாத உதவி" : "Stroke Helpline Chennai"}
              </p>
              <p className={cn("mt-0.5 text-xs font-semibold tracking-wide text-[#1b4fad] uppercase", tamil && "font-tamil normal-case")}>
                {tamil ? "பக்கவாத அறிகுறிகளைச் சரிபார்க்கவும்" : "Check stroke warning signs"}
              </p>
              {atFinder ? (
                <p className={cn("mt-1 text-[11px] leading-snug text-ink-soft", tamil && "font-tamil")}>
                  {tamil ? "அருணை நியூரோ அறக்கட்டளையின் முயற்சி" : "An initiative of Arunai Neuro Foundation"}
                </p>
              ) : null}
            </div>
          </div>
          {atFinder ? (
            <div className="flex shrink-0 gap-1 rounded-full border border-line bg-surface p-1" aria-label="Choose language">
              <button
                type="button"
                aria-pressed={session.lang === "en"}
                onClick={() => patch((current) => ({ ...current, lang: "en" }))}
                className={cn("min-h-10 rounded-full px-3 text-xs font-semibold", session.lang === "en" ? "bg-[#1b4fad] text-white" : "text-ink")}
              >
                EN
              </button>
              <button
                type="button"
                aria-pressed={session.lang === "ta"}
                onClick={() => patch((current) => ({ ...current, lang: "ta" }))}
                className={cn("font-tamil min-h-10 rounded-full px-3 text-xs font-semibold", session.lang === "ta" ? "bg-[#1b4fad] text-white" : "text-ink")}
              >
                தமிழ்
              </button>
            </div>
          ) : !atIntro ? (
            <button
              type="button"
              onClick={() => openHospitals((current) => ({ ...current, phase: "locator" }))}
              className={cn("flex min-h-11 shrink-0 items-center rounded-full bg-[#1b4fad] px-4 text-sm font-bold text-white shadow-card", tamil && "font-tamil")}
            >
              {tamil ? "மருத்துவமனைகளைக் காட்டு" : "Find hospitals"}
            </button>
          ) : null}
        </header>
        {session.phase === "locator" ? (
          <Locator
            answers={session.answers}
            user={session.user}
            concern={concern}
            lang={session.lang}
            onRecheck={() =>
              patch((current) => ({
                ...freshSession(),
                phase: "intro",
                onsetIso: current.onsetIso,
                user: current.user,
              }))
            }
            onReset={() => patch((current) => ({ ...current, onsetIso: null, user: null }))}
            onUser={(user) => patch((current) => ({ ...current, user }))}
          />
        ) : (
          <Flow
            phase={session.phase}
            signIndex={session.signIndex}
            answers={session.answers}
            onsetIso={session.onsetIso}
            timeReturn={session.timeReturn}
            lang={session.lang}
            onStart={(lang: Lang) =>
              patch((current) => ({ ...current, phase: "signs", signIndex: 0, lang }))
            }
            onSkip={() => openHospitals((current) => ({ ...current, phase: "locator" }))}
            onAnswer={(id: SignId, answer: Answer) =>
              patch((current) => {
                const answers = { ...current.answers, [id]: answer };
                const index = SIGNS.findIndex((sign) => sign.id === id);
                const isLastSign = index === SIGNS.length - 1;
                return isLastSign
                  ? { ...current, answers, phase: "locator" }
                  : { ...current, answers, signIndex: index + 1, phase: "signs" };
              })
            }
            onBack={() =>
              patch((current) => {
                if (current.phase === "signs") {
                  if (current.signIndex <= 0) return { ...current, phase: "intro" };
                  return { ...current, signIndex: current.signIndex - 1 };
                }
                if (current.phase === "time") {
                  if (current.timeReturn === "locator") return { ...current, phase: "locator" };
                  return { ...current, phase: "signs", signIndex: 4 };
                }
                return current;
              })
            }
            onSetOnset={(onsetIso) => patch((current) => ({ ...current, onsetIso }))}
            onContinue={() => openHospitals((current) => ({ ...current, phase: "locator" }))}
          />
        )}
      </main>
      <CallBar />
    </>
  );
}
