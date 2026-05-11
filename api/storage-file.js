const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

const allowedBuckets = new Set(["site-assets", "gallery"]);

function encodeStoragePath(path) {
  return path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export default async function handler(request, response) {
  try {
    if (request.method !== "GET") {
      response.status(405).json({ ok: false, error: "Method not allowed" });
      return;
    }

    if (!SUPABASE_URL) {
      response.status(500).json({
        ok: false,
        error: "Supabase URL is not configured.",
      });
      return;
    }

    const { bucket, path } = request.query;

    if (!bucket || !path) {
      response.status(400).json({
        ok: false,
        error: "Missing bucket or path.",
      });
      return;
    }

    if (!allowedBuckets.has(bucket)) {
      response.status(403).json({
        ok: false,
        error: "Bucket is not allowed.",
      });
      return;
    }

    const safePath = String(path).replace(/^\/+/, "");
    const encodedPath = encodeStoragePath(safePath);

    const fileUrl = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodedPath}`;

    const fileResponse = await fetch(fileUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!fileResponse.ok) {
      response.status(fileResponse.status).json({
        ok: false,
        error: `File request failed: ${fileResponse.status} ${fileResponse.statusText}`,
      });
      return;
    }

    const contentType =
      fileResponse.headers.get("content-type") || "application/octet-stream";

    const arrayBuffer = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    response.setHeader("Content-Type", contentType);
    response.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.setHeader("CDN-Cache-Control", "no-store");
    response.setHeader("Vercel-CDN-Cache-Control", "no-store");
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Expires", "0");

    response.status(200).send(buffer);
  } catch (error) {
    response.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}