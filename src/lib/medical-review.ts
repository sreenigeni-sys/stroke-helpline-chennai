export const CLINICAL_REVIEW_DATE = "2026-10-10";
export const CLINICAL_REVIEW_DATE_LABEL = "10 October 2026";

// Deliberately anonymous: the public pages state that a clinician verified the content,
// but do not expose the clinician's name or personal identity.
export const ANONYMOUS_CLINICIAN_REVIEWER = { "@type": "Person" } as const;
