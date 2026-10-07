import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/competition-export")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { COMPETITION_EXPORT_KEY, competitionCsv } = await import(
          "@/components/stroke/competition-store.server"
        );
        const key = new URL(request.url).searchParams.get("key");
        if (key !== COMPETITION_EXPORT_KEY) {
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
