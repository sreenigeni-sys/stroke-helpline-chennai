import { createFileRoute } from "@tanstack/react-router";
import { readStrokeCall } from "@/components/stroke/activity.functions";
import { getSql } from "@/lib/db";

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
        const sql = await getSql();
        await sql`insert into stroke_calls (window_phase, target) values (${data.window}, ${data.target})`;
        return new Response(null, { status: 204 });
      },
    },
  },
});
