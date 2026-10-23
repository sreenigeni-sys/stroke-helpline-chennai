import { createFileRoute } from "@tanstack/react-router";

// Only raster formats. SVG is deliberately excluded: served from this origin it
// can run script.
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/bmp",
]);

// Served images must never be sniffed into HTML or run anything.
const IMAGE_HEADERS = {
  "x-content-type-options": "nosniff",
  "content-security-policy": "default-src 'none'; sandbox",
  "cache-control": "public, max-age=31536000, immutable",
};

// Upload pathnames are `competition/<digits>-<safe name>-<random>.<ext>`. A strict
// allowlist (no `%`, no `/` after the folder, no dot segments) stops encoded
// `..` from escaping the folder once fetch normalises the Blob URL.
function safePath(value: string) {
  if (!/^competition\/[\w][\w.-]{0,200}$/.test(value) || value.includes("..")) return null;
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
        const type = result?.blob.contentType ?? "";
        if (!result || result.statusCode !== 200 || !result.stream || !IMAGE_TYPES.has(type)) {
          return new Response("Not found", { status: 404, headers: { "cache-control": "no-store" } });
        }
        return new Response(result.stream, { headers: { ...IMAGE_HEADERS, "content-type": type } });
      },
      POST: async () =>
        Response.json(
          { error: "Entries for the competition are now closed." },
          { status: 403, headers: { "cache-control": "no-store" } },
        ),
    },
  },
});
