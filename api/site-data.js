const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY;

function sendJson(response, data, status = 200) {
  response.status(status);

  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
  );
  response.setHeader("CDN-Cache-Control", "no-store");
  response.setHeader("Vercel-CDN-Cache-Control", "no-store");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");

  response.json(data);
}

async function supabaseGet(path) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Supabase environment variables are not configured.");
  }

  const url = `${SUPABASE_URL}/rest/v1/${path}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: "application/json",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
    cache: "no-store",
  });

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      `Supabase request failed: ${response.status} ${response.statusText} ${text}`
    );
  }

  return data;
}

function proxiedStorageUrl(bucket, storagePath) {
  if (!bucket || !storagePath) return "";

  return `/api/storage-file?bucket=${encodeURIComponent(
    bucket
  )}&path=${encodeURIComponent(storagePath)}`;
}

function prepareProfile(profile) {
  if (!profile) return null;

  return {
    ...profile,
    hero_photo_url: profile.hero_photo_path
      ? proxiedStorageUrl("site-assets", profile.hero_photo_path)
      : profile.hero_photo_url || "",
    background_image_url: profile.background_image_path
      ? proxiedStorageUrl("site-assets", profile.background_image_path)
      : profile.background_image_url || "",
  };
}

function prepareGallery(items) {
  return (items || []).map((item) => ({
    ...item,
    image_url: item.storage_path
      ? proxiedStorageUrl("gallery", item.storage_path)
      : item.image_url || "",
  }));
}

export default async function handler(request, response) {
  try {
    if (request.method !== "GET") {
      return sendJson(response, { ok: false, error: "Method not allowed" }, 405);
    }

    const [
      profileRows,
      advantages,
      services,
      materials,
      achievements,
      reviews,
      gallery,
      contactsRows,
    ] = await Promise.all([
      supabaseGet("site_profile?select=*&id=eq.main"),

      supabaseGet(
        "advantages?select=*&is_published=eq.true&order=sort_order.asc"
      ),

      supabaseGet("services?select=*&is_published=eq.true&order=sort_order.asc"),

      supabaseGet(
        "materials?select=id,title,subject,grade,description,link_url,is_published,created_at&is_published=eq.true&order=created_at.desc&limit=6"
      ),

      supabaseGet(
        "achievements?select=*&is_published=eq.true&order=sort_order.asc"
      ),

      supabaseGet("reviews?select=*&is_published=eq.true&order=created_at.desc"),

      supabaseGet(
        "gallery?select=*&is_published=eq.true&order=sort_order.asc,created_at.desc"
      ),

      supabaseGet("contacts?select=*&id=eq.main"),
    ]);

    const profile = Array.isArray(profileRows) ? profileRows[0] || null : null;
    const contacts = Array.isArray(contactsRows) ? contactsRows[0] || null : null;

    return sendJson(response, {
      ok: true,
      source: "vercel-api-proxy",
      loaded_at: new Date().toISOString(),

      profile: prepareProfile(profile),
      advantages: Array.isArray(advantages) ? advantages : [],
      services: Array.isArray(services) ? services : [],
      materials: Array.isArray(materials) ? materials : [],
      achievements: Array.isArray(achievements) ? achievements : [],
      reviews: Array.isArray(reviews) ? reviews : [],
      gallery: prepareGallery(Array.isArray(gallery) ? gallery : []),
      contacts,
    });
  } catch (error) {
    return sendJson(
      response,
      {
        ok: false,
        source: "vercel-api-proxy",
        error: error.message,
      },
      500
    );
  }
}
