import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/stroke-call")({
  server: {
    handlers: {
      POST: async () =>
        new Response("Call-event collection is disabled.", {
          status: 410,
          headers: { "cache-control": "no-store" },
        }),
    },
  },
});
