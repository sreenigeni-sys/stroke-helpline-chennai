import { SIGNS, type SignId } from "@/components/stroke/signs";

export type Answer = "yes" | "no" | "unsure";
export type Phase = "intro" | "signs" | "time" | "locator";

export type Session = {
  phase: Phase;
  signIndex: number;
  answers: Record<SignId, Answer | null>;
  onsetIso: string | null;
  timeReturn: "signs" | "locator";
  user: { lat: number; lng: number } | null;
};

const KEY = "stroke-assist-v1";

export function freshSession(): Session {
  return {
    phase: "intro",
    signIndex: 0,
    answers: { B: null, E: null, F: null, A: null, S: null },
    onsetIso: null,
    timeReturn: "signs",
    user: null,
  };
}

function validAnswer(value: unknown): Answer | null {
  return value === "yes" || value === "no" || value === "unsure" ? value : null;
}

export function loadSession(): Session {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return freshSession();
    const parsed = JSON.parse(raw) as Partial<Session>;
    const base = freshSession();
    const phase = parsed.phase;
    const okPhase =
      phase === "intro" || phase === "signs" || phase === "time" || phase === "locator";
    const answers = parsed.answers ?? base.answers;
    return {
      phase: okPhase ? phase : "intro",
      signIndex:
        typeof parsed.signIndex === "number"
          ? Math.min(SIGNS.length - 1, Math.max(0, Math.floor(parsed.signIndex)))
          : 0,
      answers: {
        B: validAnswer(answers.B),
        E: validAnswer(answers.E),
        F: validAnswer(answers.F),
        A: validAnswer(answers.A),
        S: validAnswer(answers.S),
      },
      onsetIso: typeof parsed.onsetIso === "string" ? parsed.onsetIso : null,
      timeReturn: parsed.timeReturn === "locator" ? "locator" : "signs",
      user:
        parsed.user &&
        typeof parsed.user.lat === "number" &&
        typeof parsed.user.lng === "number"
          ? { lat: parsed.user.lat, lng: parsed.user.lng }
          : null,
    };
  } catch {
    return freshSession();
  }
}

export function saveSession(session: Session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function concernOf(answers: Session["answers"]): "yes" | "unsure" | "clear" | "skipped" {
  const values = Object.values(answers);
  if (values.some((value) => value === "yes")) return "yes";
  if (values.some((value) => value === "unsure")) return "unsure";
  if (values.every((value) => value === "no")) return "clear";
  return "skipped";
}

export function markedWords(answers: Session["answers"], kind: "yes" | "unsure") {
  return SIGNS.filter((sign) => answers[sign.id] === kind).map((sign) => sign.word);
}
