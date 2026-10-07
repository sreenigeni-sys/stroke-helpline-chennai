import { createFileRoute } from "@tanstack/react-router";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

const AGES = ["12–15", "15–18", "18+ (Open to All)"];
const TOPICS = ["Time is Life"];
const ARTS = ["A4 paper, jpeg scan", "Digital art, 1080×1350 jpeg"];

function clip(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function readEntry(data: unknown) {
  if (typeof data !== "object" || data === null) throw new Error("Missing entry.");
  const raw = data as Record<string, unknown>;
  if (clip(raw.website, 200)) throw new Error("Ignored.");
  const name = clip(raw.name, 160);
  const ageGroup = clip(raw.ageGroup, 40);
  const topic = clip(raw.topic, 80);
  const art = clip(raw.art, 80);
  const phone = clip(raw.phone, 30);
  const email = clip(raw.email, 160);
  const guardian = clip(raw.guardian, 160);
  if (name.length < 2) throw new Error("Enter your name.");
  if (!AGES.includes(ageGroup) || !TOPICS.includes(topic) || !ARTS.includes(art)) {
    throw new Error("Choose an age group, topic, and kind of art.");
  }
  if (phone.replace(/\D/g, "").length < 8) throw new Error("Enter a phone number.");
  if (!email.includes("@") || email.length < 6) throw new Error("Enter an email address.");
  if (clip(raw.chennai, 10) !== "Yes") throw new Error("This competition is only for residents of Chennai.");
  if (clip(raw.original, 10) !== "Yes") throw new Error("Confirm that the artwork is entirely your own.");
  if (ageGroup !== "18+ (Open to All)" && guardian.length < 2) {
    throw new Error("Add a parent or guardian name for this age group.");
  }
  const artwork = clip(raw.artwork, 1000);
  if (!artwork.startsWith("https://")) throw new Error("Add a photo or image of the artwork.");
  return {
    submittedAt: new Date().toISOString(),
    name,
    ageGroup,
    topic,
    art,
    phone,
    email,
    guardian,
    note: clip(raw.note, 500),
    pledge: "Confirmed",
    chennai: "Yes",
    original: "Yes",
    artwork,
  };
}

export const Route = createFileRoute("/api/competition-entry")({
  server: {
    handlers: {
      GET: async () =>
        new Response("Method Not Allowed", {
          status: 405,
          headers: { allow: "POST", "cache-control": "no-store" },
        }),
      POST: async ({ request }) => {
        try {
          assertSameSiteRequest();
        } catch {
          return new Response("Forbidden", { status: 403, headers: { "cache-control": "no-store" } });
        }
        let entry: ReturnType<typeof readEntry>;
        try {
          entry = readEntry(await request.json());
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : "Bad entry";
          return Response.json({ error: message }, { status: 400, headers: { "cache-control": "no-store" } });
        }
        try {
          const { saveCompetitionEntry } = await import("@/components/stroke/competition-store.server");
          await saveCompetitionEntry(entry);
        } catch {
          return Response.json(
            { error: "The entry could not be saved. Try again." },
            { status: 503, headers: { "cache-control": "no-store" } },
          );
        }
        return Response.json({ ok: true }, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
