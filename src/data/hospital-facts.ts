import { HOSPITALS } from "@/data/hospitals";

/** What a family can act on. "check" means the listing does not clearly say. */
export type ServiceAnswer = "yes" | "no" | "check";

export type HospitalFacts = {
  ct: ServiceAnswer;
  mri: ServiceAnswer;
  thrombectomy: ServiceAnswer;
  pathway: string | null;
};

/**
 * Plain answers drawn from the existing notes.
 * 24/7 CT is Yes when the hospital is a thrombectomy centre or the note names 24-hour CT.
 * 24/7 MRI is Yes only when the note names MRI with that round-the-clock stroke service.
 * Thrombectomy is No only when the note says it is not done there.
 * A pathway sentence is included only when patients are sent to a named hospital.
 */
const FACTS: Record<string, HospitalFacts> = {
  "TN-GOV-001": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-GOV-003": { ct: "check", mri: "check", thrombectomy: "no", pathway: null },
  "TN-GOV-004": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-GOV-005": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-001": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-002": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-003": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-004": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-005": { ct: "yes", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-006": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-007A": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-007B": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-008": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-009": { ct: "yes", mri: "yes", thrombectomy: "yes", pathway: null },
  "TN-PVT-010": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-011": { ct: "yes", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-012": {
    ct: "check",
    mri: "check",
    thrombectomy: "no",
    pathway: "May be shifted to Apollo Greams Road for further care.",
  },
  "TN-PVT-014": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-015": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-017": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-GOV-007": { ct: "check", mri: "check", thrombectomy: "no", pathway: null },
  "TN-GOV-009": { ct: "check", mri: "check", thrombectomy: "no", pathway: null },
  "TN-PVT-018": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-019": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-020": { ct: "yes", mri: "check", thrombectomy: "no", pathway: null },
  "TN-PVT-021": { ct: "yes", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-023": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-024": { ct: "check", mri: "check", thrombectomy: "no", pathway: null },
  "TN-PVT-025": { ct: "check", mri: "check", thrombectomy: "no", pathway: null },
  "TN-PVT-026": { ct: "check", mri: "check", thrombectomy: "no", pathway: null },
  "TN-PVT-027": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-028": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-029": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-030": { ct: "yes", mri: "check", thrombectomy: "no", pathway: null },
  "TN-PVT-031": { ct: "check", mri: "check", thrombectomy: "no", pathway: null },
  "TN-PVT-032": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-034": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-035": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-GOV-010": { ct: "check", mri: "check", thrombectomy: "no", pathway: null },
  "TN-PVT-036": { ct: "yes", mri: "check", thrombectomy: "no", pathway: null },
  "TN-PVT-037": {
    ct: "check",
    mri: "check",
    thrombectomy: "no",
    pathway: "Shifted to Apollo OMR for further care.",
  },
};

const missing = HOSPITALS.filter((hospital) => !FACTS[hospital.id]).map((hospital) => hospital.id);
if (missing.length > 0) {
  throw new Error(`Missing plain hospital facts for ${missing.join(", ")}`);
}

export function hospitalFacts(id: string): HospitalFacts {
  return FACTS[id] ?? { ct: "check", mri: "check", thrombectomy: "check", pathway: null };
}

export function serviceWord(answer: ServiceAnswer) {
  if (answer === "yes") return "Yes";
  if (answer === "no") return "No";
  return "Call to confirm";
}
