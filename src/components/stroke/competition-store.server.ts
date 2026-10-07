const DOC = "competition-entries.json";
const BLOB_TIMEOUT_MS = 8000;

export const COMPETITION_EXPORT_KEY = "b7e4c1a9f3d26e80c5a14f7b2d9e6c31";

export type CompetitionEntry = {
  submittedAt: string;
  name: string;
  ageGroup: string;
  topic: string;
  art: string;
  phone: string;
  email: string;
  guardian: string;
  note: string;
  pledge: string;
  chennai?: string;
  original?: string;
  artwork: string;
};

type CompetitionDoc = { entries: CompetitionEntry[] };

function usesBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

async function readDoc(): Promise<CompetitionDoc> {
  const { get } = await import("@vercel/blob");
  const result = await get(DOC, {
    access: "private",
    useCache: false,
    abortSignal: AbortSignal.timeout(BLOB_TIMEOUT_MS),
  });
  if (!result || result.statusCode !== 200 || !result.stream) return { entries: [] };
  try {
    const parsed = JSON.parse(await new Response(result.stream).text()) as Partial<CompetitionDoc>;
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [] };
  } catch {
    return { entries: [] };
  }
}

let writeChain: Promise<void> = Promise.resolve();

export async function saveCompetitionEntry(entry: CompetitionEntry) {
  if (!usesBlob()) throw new Error("Entries cannot be saved right now.");
  const run = writeChain.then(async () => {
    const doc = await readDoc();
    doc.entries.push(entry);
    const { put } = await import("@vercel/blob");
    await put(DOC, JSON.stringify(doc), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 0,
      abortSignal: AbortSignal.timeout(BLOB_TIMEOUT_MS),
    });
  });
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  await run;
}

function cell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function competitionCsv() {
  const doc = usesBlob() ? await readDoc() : { entries: [] };
  const header = [
    "Submitted at",
    "Name",
    "Age group",
    "Topic",
    "Art",
    "Phone",
    "Email",
    "Parent or guardian",
    "Note",
    "Pledge",
    "Chennai resident",
    "Original work",
    "Artwork",
  ];
  const rows = doc.entries.map((entry) =>
    [
      entry.submittedAt,
      entry.name,
      entry.ageGroup,
      entry.topic,
      entry.art,
      entry.phone,
      entry.email,
      entry.guardian,
      entry.note,
      entry.pledge,
      entry.chennai ?? "",
      entry.original ?? "",
      entry.artwork,
    ]
      .map((value) => cell(value ?? ""))
      .join(","),
  );
  return [header.map(cell).join(","), ...rows].join("\n");
}
