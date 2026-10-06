import { HOSPITALS, type Hospital as HospitalRecord } from "@/data/hospitals";
import { SITE_ORIGIN } from "@/lib/seo";

export const HOSPITAL_DIRECTORY_PATH = "/stroke-hospitals-chennai";
export const HOSPITAL_DIRECTORY_URL = `${SITE_ORIGIN}${HOSPITAL_DIRECTORY_PATH}`;
export const PILOT_BRANCH_ID = "TN-PVT-001";
export const PILOT_BRANCH_PATH = "/stroke-hospital-apollo-greams-road";
export const PILOT_BRANCH_URL = `${SITE_ORIGIN}${PILOT_BRANCH_PATH}`;

function getPilotBranch(): HospitalRecord {
  const branch = HOSPITALS.find((hospital) => hospital.id === PILOT_BRANCH_ID);
  if (!branch) {
    throw new Error(`Missing branch record for schema pilot: ${PILOT_BRANCH_ID}`);
  }
  return branch;
}

export const PILOT_BRANCH = getPilotBranch();
export const PILOT_BRANCH_TITLE = "Apollo Hospitals, Greams Road, Chennai | Stroke Care";

function branchEntityId(hospital: HospitalRecord) {
  return `${HOSPITAL_DIRECTORY_URL}#hospital-${hospital.id}`;
}

function postalAddress(address: string) {
  const match = address.match(/^(.*),\s*([^,]+?)\s+(\d{6})\s*$/);
  return {
    "@type": "PostalAddress",
    streetAddress: match?.[1]?.trim() || address,
    ...(match
      ? {
          addressLocality: match[2].trim(),
          postalCode: match[3],
        }
      : {}),
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  };
}

function hospitalEntity(hospital: HospitalRecord) {
  return {
    "@type": "Hospital",
    "@id": branchEntityId(hospital),
    name: hospital.name,
    address: postalAddress(hospital.address),
    geo: {
      "@type": "GeoCoordinates",
      latitude: hospital.lat,
      longitude: hospital.lng,
    },
  };
}

export function hospitalListSchema() {
  return {
    "@type": "ItemList",
    "@id": `${HOSPITAL_DIRECTORY_URL}#hospital-list`,
    name: "Chennai hospital branches with stroke-care information",
    itemListOrder: "https://schema.org/ItemListUnordered",
    numberOfItems: HOSPITALS.length,
    itemListElement: HOSPITALS.map((hospital) => hospitalEntity(hospital)),
  };
}

export function pilotBranchPageSchema() {
  const pageId = `${PILOT_BRANCH_URL}#webpage`;
  const hospital = hospitalEntity(PILOT_BRANCH);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageId,
        url: PILOT_BRANCH_URL,
        name: PILOT_BRANCH_TITLE,
        description:
          "A branch-level directory entry. The listing does not confirm real-time services, capacity, or hospital acceptance.",
        isPartOf: { "@id": `${SITE_ORIGIN}/#website` },
        mainEntity: { "@id": hospital["@id"] },
        inLanguage: ["en-IN", "ta-IN"],
      },
      {
        ...hospital,
        mainEntityOfPage: { "@id": pageId },
      },
    ],
  };
}
