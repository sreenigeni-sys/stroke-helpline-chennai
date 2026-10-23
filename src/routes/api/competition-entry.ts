import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/competition-entry")({
  server: {
    handlers: {
      GET: async () =>
        new Response("Method Not Allowed", {
          status: 405,
          headers: { allow: "POST", "cache-control": "no-store" },
        }),
      POST: async () =>
        Response.json(
          { error: "Entries for the competition are now closed." },
          { status: 403, headers: { "cache-control": "no-store" } },
        ),
    },
  },
});
