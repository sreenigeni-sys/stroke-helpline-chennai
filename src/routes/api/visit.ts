import { createFileRoute } from "@tanstack/react-router";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

export const Route = createFileRoute("/api/visit")({
  server: {
    handlers: {
      // Public visit total for the footer counter; edge-cached so page views
      // don't each cost a Redis read.
      GET: async () => {
        const { readVisitTotal } = await import("@/lib/counter.server");
        const total = await readVisitTotal().catch(() => null);
        return Response.json(
          { total },
          { headers: { "cache-control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300" } },
        );
      },
      // Called once per browser session (see track.ts), not on every page.
      POST: async () => {
        try {
          assertSameSiteRequest();
        } catch {
          return new Response("Forbidden", { status: 403, headers: { "cache-control": "no-store" } });
        }
        const { countVisit } = await import("@/lib/counter.server");
        const total = await countVisit().catch(() => null);
        return Response.json({ total }, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
