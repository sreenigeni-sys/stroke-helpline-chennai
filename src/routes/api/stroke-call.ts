import { createFileRoute } from "@tanstack/react-router";
import { readStrokeCall } from "@/components/stroke/activity.functions";
import { saveStrokeCall } from "@/components/stroke/activity-store.server";

export const Route = createFileRoute("/api/stroke-call")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let data: ReturnType<typeof readStrokeCall>;
        try {
          data = readStrokeCall(await request.json());
        } catch {
          return new Response("Bad call", { status: 400 });
        }
        await saveStrokeCall(data.window, data.target);
        return new Response(null, { status: 204 });
      },
    },
  },
});
