import { CLINICAL_REVIEW_DATE, CLINICAL_REVIEW_DATE_LABEL } from "@/lib/medical-review";

export function ClinicalReviewNote({ scope, compact = false }: { scope?: string; compact?: boolean }) {
  return (
    <p className={compact ? "mt-3 border-t border-line pt-2 text-[11px] leading-relaxed text-ink-soft" : "mt-4 border-t border-line pt-3 text-sm leading-relaxed text-ink-soft"}>
      <strong className="text-ink">Clinician verified.</strong> Last reviewed{" "}
      <time dateTime={CLINICAL_REVIEW_DATE}>{CLINICAL_REVIEW_DATE_LABEL}</time>.
      {scope ? <> {scope}</> : null}
    </p>
  );
}
