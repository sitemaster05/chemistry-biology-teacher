import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    fetch: (url, options = {}) =>
      fetch(url, {
        ...options,
        cache: "no-store",
        headers: {
          ...(options.headers || {}),
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }),
  },
});