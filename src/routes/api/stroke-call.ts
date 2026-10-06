import { createFileRoute } from "@tanstack/react-router";
import { readStrokeCall } from "@/components/stroke/activity.functions";
import { saveStrokeCall } from "@/components/stroke/activity-store.server";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

export const Route = createFileRoute("/api/stroke-call")({
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
          return new Response("Forbidden", {
            status: 403,
            headers: { "cache-control": "no-store" },
          });
        }
        let data: ReturnType<typeof readStrokeCall>;
        try {
          data = readStrokeCall(await request.json());
        } catch {
          return new Response("Bad call", {
            status: 400,
            headers: { "cache-control": "no-store" },
          });
        }
        await saveStrokeCall(data.window, data.target);
        return new Response(null, {
          status: 204,
          headers: { "cache-control": "no-store" },
        });
      },
    },
  },
});
