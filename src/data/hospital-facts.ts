import { HOSPITALS } from "@/data/hospitals";

/**
 * "yes" means the existing source list reports a positive entry, not that the service is
 * available now or 24/7. "no" is reserved for an explicit source statement. "check" means
 * the available branch note does not confirm the service.
 */
export type ServiceAnswer = "yes" | "no" | "check";

export type HospitalFacts = {
  ct: ServiceAnswer;
  mri: ServiceAnswer;
  thrombectomy: ServiceAnswer;
  pathway: string | null;
  /** Tamil pathway line. Only set when patients are sent to a named hospital. */
  pathwayTa?: string;
};

/**
 * Conservative per-branch transcription from the existing dataset notes. Generic "comprehensive",
 * cath-lab, neurology, or network claims do not prove CT/MRI/thrombectomy at a named branch.
 * No entry here expresses service hours or live acceptance.
 */
const FACTS: Record<string, HospitalFacts> = {
  "TN-GOV-001": { ct: "check", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-GOV-003": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-GOV-004": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-GOV-005": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-001": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-002": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-003": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-004": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-005": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-006": { ct: "check", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-007A": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-007B": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-008": { ct: "check", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-009": { ct: "yes", mri: "yes", thrombectomy: "yes", pathway: null },
  "TN-PVT-010": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-011": { ct: "yes", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-012": {
    ct: "check",
    mri: "check",
    thrombectomy: "no",
    pathway: "May be shifted to Apollo Greams Road for further care.",
    pathwayTa: "மேல் சிகிச்சைக்கு அப்பல்லோ கிரீம்ஸ் சாலைக்கு மாற்றப்படலாம்.",
  },
  "TN-PVT-014": { ct: "yes", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-015": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-017": { ct: "yes", mri: "check", thrombectomy: "check", pathway: null },
  "TN-GOV-007": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-GOV-009": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-018": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-019": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-020": { ct: "yes", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-021": { ct: "yes", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-023": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-024": { ct: "yes", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-025": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-026": { ct: "check", mri: "check", thrombectomy: "no", pathway: null },
  "TN-PVT-027": { ct: "check", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-028": { ct: "check", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-029": { ct: "check", mri: "check", thrombectomy: "yes", pathway: null },
  "TN-PVT-030": { ct: "yes", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-031": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-032": { ct: "check", mri: "yes", thrombectomy: "yes", pathway: null },
  "TN-PVT-034": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-034B": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-035": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-GOV-010": { ct: "check", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-036": { ct: "yes", mri: "check", thrombectomy: "check", pathway: null },
  "TN-PVT-037": {
    ct: "check",
    mri: "check",
    thrombectomy: "no",
    pathway: "Shifted to Apollo OMR for further care.",
    pathwayTa: "மேல் சிகிச்சைக்கு அப்பல்லோ ஓஎம்ஆருக்கு மாற்றப்படும்.",
  },
};

const missing = HOSPITALS.filter((hospital) => !FACTS[hospital.id]).map((hospital) => hospital.id);
if (missing.length > 0) {
  throw new Error(`Missing plain hospital facts for ${missing.join(", ")}`);
}

export function hospitalFacts(id: string): HospitalFacts {
  return FACTS[id] ?? { ct: "check", mri: "check", thrombectomy: "check", pathway: null };
}

export function pathwayLine(id: string, lang?: "en" | "ta" | null) {
  const facts = hospitalFacts(id);
  if (!facts.pathway) return null;
  if (lang === "ta") return facts.pathwayTa ?? facts.pathway;
  return facts.pathway;
}

export function serviceWord(answer: ServiceAnswer, lang?: "en" | "ta" | null) {
  const tamil = lang === "ta";
  if (answer === "yes") return tamil ? "பட்டியலிடப்பட்டுள்ளது" : "Listed";
  if (answer === "no") return tamil ? "பட்டியலில் இல்லை" : "Not listed";
  return tamil ? "அழைத்துக் கேளுங்கள்" : "Call to confirm";
}
