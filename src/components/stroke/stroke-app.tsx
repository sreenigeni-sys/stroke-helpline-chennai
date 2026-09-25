import { useEffect, useRef, useState } from "react";
import { SIGNS, type SignId } from "@/components/stroke/signs";
import {
  concernOf,
  freshSession,
  loadSession,
  saveSession,
  type Answer,
  type Session,
} from "@/components/stroke/session";
import { Flow } from "@/components/stroke/flow";
import { Locator } from "@/components/stroke/locator";

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

  const concern = concernOf(session.answers);

  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 pt-4">
        <div className="flex items-center gap-3">
          <span className="call-dot shrink-0" aria-hidden="true" />
          <div>
            <p className="font-display text-xl leading-tight">Stroke Helpline Chennai</p>
            <p className="mt-1 text-xs font-semibold tracking-wide text-signal uppercase">
              Act now
            </p>
          </div>
        </div>
      </header>
      {session.phase === "locator" ? (
        <Locator
          answers={session.answers}
          onsetIso={session.onsetIso}
          user={session.user}
          concern={concern}
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
          onStart={() => patch((current) => ({ ...current, phase: "signs", signIndex: 0 }))}
          onSkip={() => patch((current) => ({ ...current, phase: "locator" }))}
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
          onBack={() =>
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
            })
          }
          onSetOnset={(onsetIso) => patch((current) => ({ ...current, onsetIso }))}
          onContinue={() => patch((current) => ({ ...current, phase: "locator" }))}
        />
      )}
    </main>
  );
}
