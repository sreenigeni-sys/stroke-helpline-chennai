import { createFileRoute } from "@tanstack/react-router";
import { HOSPITALS } from "@/data/hospitals";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

const KINDS = new Set(["call", "directions"]);
const WINDOWS = new Set(["unset", "future", "green", "orange", "past"]);
const HOSPITAL_IDS = new Set(HOSPITALS.map((hospital) => hospital.id));

function readClick(data: unknown) {
  if (typeof data !== "object" || data === null) return null;
  const raw = data as Record<string, unknown>;
  // Only known values, so nobody can grow the stats with arbitrary fields.
  if (typeof raw.kind !== "string" || !KINDS.has(raw.kind)) return null;
  if (typeof raw.hospital !== "string" || !HOSPITAL_IDS.has(raw.hospital)) return null;
  const window = typeof raw.window === "string" && WINDOWS.has(raw.window) ? raw.window : "unset";
  return {
    kind: raw.kind as "call" | "directions",
    hospital: raw.hospital,
    window,
    to108: raw.to108 === true,
  };
}

export const Route = createFileRoute("/api/click")({
  server: {
    handlers: {
      GET: async () =>
        new Response("Method Not Allowed", { status: 405, headers: { allow: "POST", "cache-control": "no-store" } }),
      POST: async ({ request }) => {
        try {
          assertSameSiteRequest();
        } catch {
          return new Response("Forbidden", { status: 403, headers: { "cache-control": "no-store" } });
        }
        const click = readClick(await request.json().catch(() => null));
        if (!click) return new Response("Bad click", { status: 400, headers: { "cache-control": "no-store" } });
        const { countClick } = await import("@/lib/counter.server");
        await countClick(click).catch(() => undefined);
        return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
      },
    },
  },
});
