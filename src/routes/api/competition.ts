import { createFileRoute } from "@tanstack/react-router";
import { assertSameSiteRequest } from "@/lib/auth/isolation.server";

const MAX_BYTES = 3 * 1024 * 1024;

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

function sniffImageType(bytes: Uint8Array): string | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "GIF8") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(0, 2) === "BM") return "image/bmp";
  if (ascii(4, 8) === "ftyp") {
    const brand = ascii(8, 12);
    if (["heic", "heix", "hevc", "hevx", "heim", "heis"].includes(brand)) return "image/heic";
    if (["mif1", "msf1"].includes(brand)) return "image/heif";
  }
  return null;
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
        const bytes = new Uint8Array(await file.arrayBuffer());
        // Trust the file's bytes, not the browser-supplied type or name.
        const contentType = sniffImageType(bytes);
        if (!contentType) {
          return Response.json({ error: "Use one JPEG, PNG, WebP, GIF or HEIC image under 3 MB." }, { status: 400 });
        }
        const safe = file.name.replace(/[^\w.-]+/g, "-").replace(/^[.-]+/, "").slice(0, 60) || "artwork";
        try {
          const { put } = await import("@vercel/blob");
          const saved = await put(`competition/${Date.now()}-${safe}`, new Blob([bytes], { type: contentType }), {
            access: "private",
            addRandomSuffix: true,
            contentType,
            abortSignal: AbortSignal.timeout(20000),
          });
          const url = `${new URL(request.url).origin}/api/competition?path=${encodeURIComponent(saved.pathname)}`;
          return Response.json({ url }, { headers: { "cache-control": "no-store" } });
        } catch {
          return Response.json({ error: "The picture could not be uploaded. Try again." }, { status: 503 });
        }
      },
    },
  },
});
