import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const defaultDesign = {
  theme_preset: "science",
  background_style: "aurora",
  card_style: "glass",
  animation_style: "smooth",
  animation_intensity: "medium",
  rounded_style: "extra",
  glow_enabled: true,
  particles_enabled: true,
};

const themes = {
  science: {
    bg: "#020617",
    bg2: "#0f172a",
    primary: "#67e8f9",
    primarySoft: "rgba(103, 232, 249, 0.18)",
    secondary: "#6ee7b7",
    secondarySoft: "rgba(110, 231, 183, 0.18)",
    accent: "#93c5fd",
    text: "#f8fafc",
  },
  biology: {
    bg: "#03150e",
    bg2: "#052e16",
    primary: "#86efac",
    primarySoft: "rgba(134, 239, 172, 0.18)",
    secondary: "#bef264",
    secondarySoft: "rgba(190, 242, 100, 0.18)",
    accent: "#5eead4",
    text: "#f7fee7",
  },
  premium: {
    bg: "#09090f",
    bg2: "#171326",
    primary: "#c4b5fd",
    primarySoft: "rgba(196, 181, 253, 0.18)",
    secondary: "#67e8f9",
    secondarySoft: "rgba(103, 232, 249, 0.16)",
    accent: "#f0abfc",
    text: "#faf5ff",
  },
  sunset: {
    bg: "#160b0b",
    bg2: "#2a1010",
    primary: "#fdba74",
    primarySoft: "rgba(253, 186, 116, 0.18)",
    secondary: "#fda4af",
    secondarySoft: "rgba(253, 164, 175, 0.16)",
    accent: "#fde68a",
    text: "#fff7ed",
  },
};

function getAnimationDuration(intensity) {
  if (intensity === "soft") return "22s";
  if (intensity === "strong") return "8s";
  return "14s";
}

function getBackgroundCss(design, theme) {
  const animationDuration = getAnimationDuration(design.animation_intensity);
  const animationsEnabled = design.animation_style !== "none";
  const animation = animationsEnabled
    ? `designAurora ${animationDuration} ease-in-out infinite alternate`
    : "none";

  if (design.background_style === "grid") {
    return `
      body::before {
        background:
          radial-gradient(circle at 20% 20%, ${theme.primarySoft}, transparent 34%),
          radial-gradient(circle at 80% 25%, ${theme.secondarySoft}, transparent 35%),
          linear-gradient(135deg, ${theme.bg}, ${theme.bg2});
        animation: ${animation};
      }

      body::after {
        background-image:
          linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px);
        background-size: 48px 48px;
        opacity: 0.45;
      }
    `;
  }

  if (design.background_style === "particles") {
    return `
      body::before {
        background:
          radial-gradient(circle at 15% 20%, ${theme.primarySoft}, transparent 34%),
          radial-gradient(circle at 85% 15%, ${theme.secondarySoft}, transparent 35%),
          radial-gradient(circle at 50% 90%, rgba(147, 197, 253, 0.16), transparent 32%),
          linear-gradient(135deg, ${theme.bg}, ${theme.bg2});
        animation: ${animation};
      }

      body::after {
        background-image:
          radial-gradient(circle, ${theme.primary} 1px, transparent 1px),
          radial-gradient(circle, ${theme.secondary} 1px, transparent 1px);
        background-position: 0 0, 24px 24px;
        background-size: 52px 52px;
        opacity: 0.16;
        animation: ${
          animationsEnabled
            ? `designParticles ${animationDuration} linear infinite`
            : "none"
        };
      }
    `;
  }

  if (design.background_style === "dna") {
    return `
      body::before {
        background:
          radial-gradient(circle at 25% 20%, ${theme.primarySoft}, transparent 34%),
          radial-gradient(circle at 75% 25%, ${theme.secondarySoft}, transparent 35%),
          linear-gradient(135deg, ${theme.bg}, ${theme.bg2});
        animation: ${animation};
      }

      body::after {
        background-image:
          repeating-linear-gradient(
            115deg,
            transparent 0px,
            transparent 20px,
            ${theme.primarySoft} 21px,
            transparent 22px,
            transparent 42px,
            ${theme.secondarySoft} 43px,
            transparent 44px
          );
        opacity: 0.25;
        animation: ${
          animationsEnabled
            ? `designDna ${animationDuration} linear infinite`
            : "none"
        };
      }
    `;
  }

  return `
    body::before {
      background:
        radial-gradient(circle at 16% 18%, ${theme.primarySoft}, transparent 34%),
        radial-gradient(circle at 84% 22%, ${theme.secondarySoft}, transparent 35%),
        radial-gradient(circle at 50% 88%, rgba(147, 197, 253, 0.16), transparent 33%),
        linear-gradient(135deg, ${theme.bg}, ${theme.bg2});
      animation: ${animation};
    }

    body::after {
      background:
        linear-gradient(120deg, transparent, rgba(255,255,255,0.035), transparent);
      opacity: 0.8;
      animation: ${
        animationsEnabled
          ? `designLightSweep ${animationDuration} ease-in-out infinite`
          : "none"
      };
    }
  `;
}

function getCardCss(design, theme) {
  if (design.card_style === "solid") {
    return `
      body .bg-white\\/5,
      body .bg-slate-900\\/70,
      body .bg-slate-900\\/80 {
        background: rgba(15, 23, 42, 0.92) !important;
        border-color: rgba(255,255,255,0.10) !important;
        box-shadow: 0 18px 45px rgba(0,0,0,0.28) !important;
      }
    `;
  }

  if (design.card_style === "neon") {
    return `
      body .bg-white\\/5,
      body .bg-slate-900\\/70,
      body .bg-slate-900\\/80 {
        background: rgba(2, 6, 23, 0.62) !important;
        border-color: ${theme.primarySoft} !important;
        box-shadow:
          0 0 0 1px ${theme.primarySoft},
          0 22px 70px rgba(0,0,0,0.32),
          0 0 42px ${theme.primarySoft} !important;
      }
    `;
  }

  return `
    body .bg-white\\/5,
    body .bg-slate-900\\/70,
    body .bg-slate-900\\/80 {
      background: rgba(255,255,255,0.065) !important;
      border-color: rgba(255,255,255,0.13) !important;
      backdrop-filter: blur(22px) !important;
      box-shadow: 0 24px 80px rgba(0,0,0,0.24) !important;
    }
  `;
}

function SiteDesignProvider() {
  const [design, setDesign] = useState(defaultDesign);

  const loadDesign = useCallback(async () => {
    const { data, error } = await supabase
      .from("site_design")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    if (!error && data) {
      setDesign({
        ...defaultDesign,
        ...data,
      });
    }
  }, []);

  useEffect(() => {
    loadDesign();

    const interval = setInterval(loadDesign, 5000);

    const channel = supabase
      .channel("site-design-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_design" },
        loadDesign
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [loadDesign]);

  const css = useMemo(() => {
    const theme = themes[design.theme_preset] || themes.science;
    const backgroundCss = getBackgroundCss(design, theme);
    const cardCss = getCardCss(design, theme);

    const glowCss = design.glow_enabled
      ? `
        body .shadow-2xl,
        body .shadow-xl {
          box-shadow:
            0 22px 80px rgba(0,0,0,0.34),
            0 0 38px ${theme.primarySoft} !important;
        }
      `
      : `
        body .shadow-2xl,
        body .shadow-xl {
          box-shadow: 0 18px 60px rgba(0,0,0,0.28) !important;
        }
      `;

    const roundedCss =
      design.rounded_style === "soft"
        ? `
          body .rounded-\\[2rem\\],
          body .rounded-\\[3rem\\],
          body .rounded-3xl {
            border-radius: 1.25rem !important;
          }
        `
        : `
          body .rounded-\\[2rem\\],
          body .rounded-\\[3rem\\],
          body .rounded-3xl {
            border-radius: 2rem !important;
          }
        `;

    const particlesCss = design.particles_enabled
      ? ""
      : `
        body::after {
          display: none !important;
        }
      `;

    return `
      :root {
        --site-bg: ${theme.bg};
        --site-bg-2: ${theme.bg2};
        --site-primary: ${theme.primary};
        --site-primary-soft: ${theme.primarySoft};
        --site-secondary: ${theme.secondary};
        --site-secondary-soft: ${theme.secondarySoft};
        --site-accent: ${theme.accent};
        --site-text: ${theme.text};
      }

      html {
        scroll-behavior: smooth;
        background: var(--site-bg);
      }

      body {
        background: var(--site-bg) !important;
        color: var(--site-text);
        overflow-x: hidden;
      }

      body::before,
      body::after {
        content: "";
        position: fixed;
        inset: 0;
        pointer-events: none;
      }

      body::before {
        z-index: 0;
      }

      body::after {
        z-index: 0;
      }

      #root {
        position: relative;
        z-index: 1;
        isolation: isolate;
      }

      body main {
        background: transparent !important;
      }

      body .text-cyan-200,
      body .text-cyan-300 {
        color: var(--site-primary) !important;
      }

      body .text-emerald-200,
      body .text-emerald-300 {
        color: var(--site-secondary) !important;
      }

      body .bg-cyan-300 {
        background: var(--site-primary) !important;
      }

      body .bg-emerald-300 {
        background: var(--site-secondary) !important;
      }

      body .border-cyan-300\\/20,
      body .border-cyan-300\\/30,
      body .border-emerald-300\\/20,
      body .border-emerald-300\\/30 {
        border-color: var(--site-primary-soft) !important;
      }

      body .bg-cyan-300\\/10,
      body .bg-cyan-400\\/15,
      body .bg-cyan-500\\/20 {
        background: var(--site-primary-soft) !important;
      }

      body .bg-emerald-300\\/10,
      body .bg-emerald-500\\/20 {
        background: var(--site-secondary-soft) !important;
      }

      body a,
      body button {
        transition:
          transform 220ms ease,
          background-color 220ms ease,
          border-color 220ms ease,
          box-shadow 220ms ease,
          color 220ms ease;
      }

      body a:hover,
      body button:hover {
        transform: translateY(-1px);
      }

      ${backgroundCss}
      ${cardCss}
      ${glowCss}
      ${roundedCss}
      ${particlesCss}

      @keyframes designAurora {
        0% {
          transform: scale(1) translate3d(0, 0, 0);
          filter: hue-rotate(0deg);
        }
        100% {
          transform: scale(1.06) translate3d(1.5%, -1.5%, 0);
          filter: hue-rotate(10deg);
        }
      }

      @keyframes designParticles {
        0% {
          background-position: 0 0, 24px 24px;
        }
        100% {
          background-position: 52px 52px, 76px 76px;
        }
      }

      @keyframes designDna {
        0% {
          background-position: 0 0;
        }
        100% {
          background-position: 160px 160px;
        }
      }

      @keyframes designLightSweep {
        0% {
          transform: translateX(-18%);
          opacity: 0.25;
        }
        50% {
          opacity: 0.65;
        }
        100% {
          transform: translateX(18%);
          opacity: 0.25;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        body::before,
        body::after,
        * {
          animation: none !important;
          transition: none !important;
        }
      }
    `;
  }, [design]);

  return <style>{css}</style>;
}

export default SiteDesignProvider;