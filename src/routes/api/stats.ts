import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { readStats, statsKeyMatches } = await import("@/lib/counter.server");
        // The key comes in a header, so it never lands in URLs or server logs.
        if (!statsKeyMatches(request.headers.get("x-stats-key"))) {
          return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
        }
        try {
          return Response.json(await readStats(), { headers: { "cache-control": "no-store" } });
        } catch {
          return Response.json({ error: "Couldn't read the counters." }, { status: 503, headers: { "cache-control": "no-store" } });
        }
      },
    },
  },
});
