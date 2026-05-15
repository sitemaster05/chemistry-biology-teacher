import { supabase } from "./supabase";

const siteDataTimeoutMs = 6000;

async function fetchJsonWithTimeout(url) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), siteDataTimeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(
        data.error || "Не удалось загрузить данные сайта через API."
      );
    }

    return data;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function publicStorageUrl(bucket, storagePath) {
  if (!storagePath) return "";

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl || "";
}

function prepareProfile(profile) {
  if (!profile) return null;

  return {
    ...profile,
    hero_photo_url: profile.hero_photo_path
      ? publicStorageUrl("site-assets", profile.hero_photo_path)
      : profile.hero_photo_url || "",
    background_image_url: profile.background_image_path
      ? publicStorageUrl("site-assets", profile.background_image_path)
      : profile.background_image_url || "",
  };
}

function prepareGallery(items) {
  return (items || []).map((item) => ({
    ...item,
    image_url: item.storage_path
      ? publicStorageUrl("gallery", item.storage_path)
      : item.image_url || "",
  }));
}

async function loadSiteDataFromSupabase() {
  const [
    profileResult,
    advantagesResult,
    servicesResult,
    materialsResult,
    achievementsResult,
    reviewsResult,
    galleryResult,
    contactsResult,
  ] = await Promise.all([
    supabase.from("site_profile").select("*").eq("id", "main").maybeSingle(),
    supabase
      .from("advantages")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("services")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("materials")
      .select(
        "id,title,subject,grade,description,link_url,is_published,created_at"
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("achievements")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("reviews")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("gallery")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase.from("contacts").select("*").eq("id", "main").maybeSingle(),
  ]);

  const failedResult = [
    profileResult,
    advantagesResult,
    servicesResult,
    materialsResult,
    achievementsResult,
    reviewsResult,
    galleryResult,
    contactsResult,
  ].find((result) => result.error);

  if (failedResult) {
    throw new Error(failedResult.error.message);
  }

  return {
    ok: true,
    source: "supabase-client-fallback",
    loaded_at: new Date().toISOString(),
    profile: prepareProfile(profileResult.data),
    advantages: advantagesResult.data || [],
    services: servicesResult.data || [],
    materials: materialsResult.data || [],
    achievements: achievementsResult.data || [],
    reviews: reviewsResult.data || [],
    gallery: prepareGallery(galleryResult.data || []),
    contacts: contactsResult.data || null,
  };
}

export async function loadSiteDataFromApi() {
  try {
    return await fetchJsonWithTimeout(`/api/site-data?t=${Date.now()}`);
  } catch (error) {
    if (!import.meta.env.DEV) {
      throw error;
    }

    console.warn("Vercel API is unavailable locally, using Supabase fallback.");
    return loadSiteDataFromSupabase();
  }
}
