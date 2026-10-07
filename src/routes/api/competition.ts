import { createFileRoute } from "@tanstack/react-router";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

const MAX_BYTES = 3 * 1024 * 1024;

export const Route = createFileRoute("/api/competition")({
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
          return new Response("Forbidden", { status: 403, headers: { "cache-control": "no-store" } });
        }
        if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
          return Response.json({ error: "Upload is not available." }, { status: 503 });
        }
        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return Response.json({ error: "Missing picture." }, { status: 400 });
        }
        const file = form.get("file");
        if (!(file instanceof File) || file.size < 1 || file.size > MAX_BYTES) {
          return Response.json({ error: "Use an image under 3 MB." }, { status: 400 });
        }
        if (!file.type.startsWith("image/")) {
          return Response.json({ error: "Use one image under 3 MB." }, { status: 400 });
        }
        const safe = file.name.replace(/[^\w.-]+/g, "-").slice(0, 60) || "artwork";
        const { put } = await import("@vercel/blob");
        const saved = await put(`competition/${Date.now()}-${safe}`, file, {
          access: "public",
          addRandomSuffix: true,
          contentType: file.type || "image/jpeg",
          abortSignal: AbortSignal.timeout(20000),
        });
        return Response.json({ url: saved.url }, { headers: { "cache-control": "no-store" } });
      },
    },
  },
});
