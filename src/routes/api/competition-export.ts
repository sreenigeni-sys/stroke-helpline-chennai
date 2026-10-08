import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/competition-export")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { exportKeyMatches, competitionCsv } = await import(
          "@/components/stroke/competition-store.server"
        );
        if (!exportKeyMatches(new URL(request.url).searchParams.get("key"))) {
          return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
        }
        const csv = await competitionCsv();
        return new Response(csv, {
          headers: {
            "content-type": "text/csv; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
