import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function DebugPage() {
  const [result, setResult] = useState({
    loading: true,
    env: {},
    profile: null,
    contacts: null,
    services: null,
    error: null,
  });

  useEffect(() => {
    async function runDebug() {
      const envInfo = {
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL || "НЕ НАЙДЕН",
        hasKey: Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
        keyStart: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
          ? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.slice(0, 12) + "..."
          : "НЕ НАЙДЕН",
        mode: import.meta.env.MODE,
        prod: import.meta.env.PROD,
        dev: import.meta.env.DEV,
        currentUrl: window.location.href,
        userAgent: navigator.userAgent,
      };

      try {
        const profileResponse = await supabase
          .from("site_profile")
          .select("*")
          .eq("id", "main")
          .maybeSingle();

        const contactsResponse = await supabase
          .from("contacts")
          .select("*")
          .eq("id", "main")
          .maybeSingle();

        const servicesResponse = await supabase
          .from("services")
          .select("*")
          .order("sort_order", { ascending: true });

        setResult({
          loading: false,
          env: envInfo,
          profile: {
            data: profileResponse.data,
            error: profileResponse.error,
          },
          contacts: {
            data: contactsResponse.data,
            error: contactsResponse.error,
          },
          services: {
            data: servicesResponse.data,
            error: servicesResponse.error,
          },
          error: null,
        });
      } catch (error) {
        setResult({
          loading: false,
          env: envInfo,
          profile: null,
          contacts: null,
          services: null,
          error: {
            message: error.message,
            name: error.name,
          },
        });
      }
    }

    runDebug();
  }, []);

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <h1 style={styles.title}>Supabase Debug</h1>

        <p style={styles.text}>
          Эта страница показывает, что именно публичный сайт получает из
          Supabase.
        </p>

        {result.loading ? (
          <p style={styles.loading}>Загрузка диагностики...</p>
        ) : (
          <div style={styles.grid}>
            <DebugBlock title="ENV / Vercel" data={result.env} />

            <DebugBlock title="site_profile" data={result.profile} />

            <DebugBlock title="contacts" data={result.contacts} />

            <DebugBlock title="services" data={result.services} />

            {result.error && (
              <DebugBlock title="Общая ошибка" data={result.error} />
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function DebugBlock({ title, data }) {
  return (
    <div style={styles.block}>
      <h2 style={styles.blockTitle}>{title}</h2>

      <pre style={styles.pre}>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#020617",
    color: "#e5e7eb",
    padding: "32px",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  },
  card: {
    maxWidth: "1100px",
    margin: "0 auto",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "28px",
    background: "rgba(255,255,255,0.06)",
    padding: "28px",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: 900,
    color: "#fff",
  },
  text: {
    marginTop: "12px",
    color: "#94a3b8",
    lineHeight: 1.7,
  },
  loading: {
    marginTop: "24px",
    color: "#67e8f9",
  },
  grid: {
    display: "grid",
    gap: "20px",
    marginTop: "28px",
  },
  block: {
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    background: "rgba(2,6,23,0.85)",
    padding: "20px",
    overflow: "auto",
  },
  blockTitle: {
    margin: "0 0 14px",
    fontSize: "20px",
    color: "#67e8f9",
  },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: 0,
    fontSize: "13px",
    lineHeight: 1.6,
    color: "#d1d5db",
  },
};

export default DebugPage;