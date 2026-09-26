import { useEffect, useRef, useState } from "react";
import { SIGNS, type SignId } from "@/components/stroke/signs";
import {
  concernOf,
  freshSession,
  loadSession,
  saveSession,
  type Answer,
  type Lang,
  type Session,
} from "@/components/stroke/session";
import { Flow } from "@/components/stroke/flow";
import { Locator } from "@/components/stroke/locator";
import { beginGps } from "@/components/stroke/gps";
import { cn } from "@/lib/cn";

export function StrokeApp() {
  const [session, setSession] = useState<Session>(freshSession);
  const skipSave = useRef(true);

  useEffect(() => {
    setSession(loadSession());
  }, []);

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    saveSession(session);
  }, [session]);

  function patch(update: (current: Session) => Session) {
    setSession((current) => update(current));
  }

  function openHospitals(update: (current: Session) => Session) {
    try {
      if (!session.user?.label) beginGps();
    } catch {
      // Still open the list. The location button can ask again.
    }
    patch(update);
  }

  const concern = concernOf(session.answers);
  const home = session.phase !== "intro";
  const tamil = session.lang === "ta";

  function goHome() {
    patch((current) => ({
      ...freshSession(),
      onsetIso: current.onsetIso,
      user: current.user,
    }));
  }

  return (
    <main className="min-h-screen">
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
              {tamil ? "உடனே செய்யுங்கள்" : "Act now"}
            </p>
            {session.phase === "intro" || session.phase === "locator" ? (
              <p className={cn("mt-1 text-[11px] leading-snug text-ink-soft", tamil && "font-tamil")}>
                {tamil ? "அருணை நியூரோ அறக்கட்டளையின் முயற்சி" : "An initiative of Arunai Neuro Foundation"}
              </p>
            ) : null}
          </div>
        </div>
        {home ? (
          <button
            type="button"
            onClick={goHome}
            className={cn("shrink-0 pt-1 text-right text-sm font-semibold text-[#1b4fad]", tamil && "font-tamil")}
          >
            {tamil ? (
              "முகப்பு"
            ) : session.lang === "en" ? (
              "Back"
            ) : (
              <>
                Back
                <span className="font-tamil block text-xs font-medium text-ink-soft">முகப்பு</span>
              </>
            )}
          </button>
        ) : null}
      </header>
      {session.phase === "locator" ? (
        <Locator
          answers={session.answers}
          onsetIso={session.onsetIso}
          user={session.user}
          concern={concern}
          lang={session.lang}
          onEditTime={() => patch((current) => ({ ...current, phase: "time", timeReturn: "locator" }))}
          onRecheck={() =>
            patch((current) => ({
              ...freshSession(),
              onsetIso: current.onsetIso,
              user: current.user,
            }))
          }
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
              if (index >= SIGNS.length - 1) {
                return { ...current, answers, phase: "time", timeReturn: "signs" };
              }
              return { ...current, answers, signIndex: index + 1, phase: "signs" };
            })
          }
          onBack={() => {
            if (session.phase === "time" && session.timeReturn === "locator" && !session.user?.label) {
              try {
                beginGps();
              } catch {
                // The hospital page asks again if this fails.
              }
            }
            patch((current) => {
              if (current.phase === "signs") {
                if (current.signIndex <= 0) return { ...current, phase: "intro" };
                return { ...current, signIndex: current.signIndex - 1 };
              }
              if (current.phase === "time") {
                if (current.timeReturn === "locator") return { ...current, phase: "locator" };
                return { ...current, phase: "signs", signIndex: SIGNS.length - 1 };
              }
              return current;
            });
          }}
          onSetOnset={(onsetIso) => patch((current) => ({ ...current, onsetIso }))}
          onContinue={() => openHospitals((current) => ({ ...current, phase: "locator" }))}
        />
      )}
    </main>
  );
}
