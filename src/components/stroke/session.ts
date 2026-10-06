import { SIGNS, type SignId } from "@/components/stroke/signs";

export type Answer = "yes" | "no" | "unsure";
export type Phase = "intro" | "signs" | "time" | "locator";
export type Lang = "en" | "ta";

export type Session = {
  phase: Phase;
  signIndex: number;
  answers: Record<SignId, Answer | null>;
  onsetIso: string | null;
  timeReturn: "signs" | "locator";
  lang: Lang | null;
  user: { lat: number; lng: number; at?: number; accuracy?: number; label?: string } | null;
};

export function freshSession(): Session {
  return {
    phase: "intro",
    signIndex: 0,
    answers: { B: null, E: null, F: null, A: null, S: null },
    onsetIso: null,
    timeReturn: "signs",
    lang: null,
    user: null,
  };
}

export function concernOf(answers: Session["answers"]): "yes" | "unsure" | "clear" | "skipped" {
  const values = Object.values(answers);
  if (values.some((value) => value === "yes")) return "yes";
  if (values.some((value) => value === "unsure")) return "unsure";
  if (values.every((value) => value === "no")) return "clear";
  return "skipped";
}

export function markedWords(
  answers: Session["answers"],
  kind: "yes" | "unsure",
  lang?: Lang | null,
) {
  return SIGNS.filter((sign) => answers[sign.id] === kind).map((sign) =>
    lang === "ta" ? sign.wordTa : sign.word,
  );
}
