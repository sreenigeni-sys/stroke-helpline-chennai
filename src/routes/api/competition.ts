import { createFileRoute } from "@tanstack/react-router";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

const MAX_BYTES = 3 * 1024 * 1024;

function safePath(value: string) {
  if (!value.startsWith("competition/") || value.includes("..") || value.includes("\\") || value.includes("\0")) {
    return null;
  }
  return value;
}

export const Route = createFileRoute("/api/competition")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const path = safePath(new URL(request.url).searchParams.get("path") ?? "");
        if (!path || !process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
          return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
        }
        const { get } = await import("@vercel/blob");
        const result = await get(path, { access: "private" });
        if (!result || result.statusCode !== 200 || !result.stream) {
          return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
        }
        return new Response(result.stream, {
          headers: {
            "content-type": result.blob.contentType || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
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
        const name = file.name.toLowerCase();
        const image = file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif|bmp)$/.test(name);
        if (!image) {
          return Response.json({ error: "Use one image under 3 MB." }, { status: 400 });
        }
        const safe = file.name.replace(/[^\w.-]+/g, "-").slice(0, 60) || "artwork";
        try {
          const { put } = await import("@vercel/blob");
          const bytes = new Uint8Array(await file.arrayBuffer());
          const saved = await put(`competition/${Date.now()}-${safe}`, bytes, {
            access: "private",
            addRandomSuffix: true,
            contentType: file.type.startsWith("image/") ? file.type : "image/jpeg",
            abortSignal: AbortSignal.timeout(20000),
          });
          const url = `${new URL(request.url).origin}/api/competition?path=${encodeURIComponent(saved.pathname)}`;
          return Response.json({ url }, { headers: { "cache-control": "no-store" } });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Upload failed.";
          return Response.json({ error: message.slice(0, 180) }, { status: 503 });
        }
      },
    },
  },
});