import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { loadSiteDataFromApi } from "../lib/siteDataApi";
import { normalizeTelegramUrl, safeExternalUrl } from "../lib/contactLinks";
import {
  ArrowUp,
  Atom,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Dna,
  FlaskConical,
  GraduationCap,
  Image as ImageIcon,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Microscope,
  Phone,
  Send,
  Sparkles,
  Star,
  Trophy,
  X,
} from "lucide-react";

const defaultProfile = {
  full_name: "Алиосманова Кристина",
  profession: "Учитель химии и биологии",

  hero_badge: "Современное обучение химии и биологии",
  hero_title: "Учитель",
  hero_highlight: "химии и биологии",
  hero_description:
    "Помогаю ученикам понимать сложные темы простым языком, готовиться к урокам, контрольным, олимпиадам и экзаменам.",

  experience_value: "5+",
  experience_label: "лет опыта",

  materials_value: "100+",
  materials_label: "материалов",

  access_value: "24/7",
  access_label: "доступ к сайту",

  about_title: "Обучение с понятной структурой",
  about_text:
    "Главная цель — не просто выучить параграф, а действительно понять тему, увидеть логику и научиться применять знания.",

  approach_title: "Мой подход",
  approach_text:
    "Я объясняю химию и биологию через схемы, примеры, визуальные образы и практические задания. Для каждого ученика подбираю темп и формат занятий, чтобы материал был понятным и полезным.",

  science_card_title: "Наука может быть понятной",
  science_card_text:
    "Химия и биология становятся интереснее, когда ученик видит связь между формулами, клетками, реакциями и реальной жизнью.",

  hero_photo_url: "",
  hero_photo_path: "",
  background_image_url: "",
  background_image_path: "",
  background_overlay_opacity: 0.72,
};

const defaultContacts = {
  phone: "+7 999 999-99-99",
  email: "teacher@example.com",
  telegram_url: "https://t.me/",
  whatsapp_url: "",
  city: "Ваш город / онлайн-занятия",
  address: "",
  map_url: "",
};

const siteDataCacheKey = "teacher-site-data-cache-v1";

const navLinks = [
  { href: "#about", label: "Обо мне" },
  { href: "#services", label: "Направления" },
  { href: "#materials", label: "Материалы" },
  { href: "#achievements", label: "Достижения" },
  { href: "#gallery", label: "Галерея" },
  { href: "#contacts", label: "Контакты" },
];

const sectionMotion = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.7, ease: "easeOut" },
};

function EmptyState({ icon: Icon = Sparkles, title, text }) {
  return (
    <div className="premium-panel mx-auto max-w-3xl p-8 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-cyan-200">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="text-xl font-bold text-white">{title}</h3>

      {text && <p className="mt-3 text-sm leading-6 text-slate-400">{text}</p>}
    </div>
  );
}

function readCachedSiteData() {
  if (typeof window === "undefined") return null;

  try {
    const rawData = window.localStorage.getItem(siteDataCacheKey);
    return rawData ? JSON.parse(rawData) : null;
  } catch {
    return null;
  }
}

function writeCachedSiteData(data) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(siteDataCacheKey, JSON.stringify(data));
  } catch {
    // Cache is only a visual optimization; the live API remains the source.
  }
}

function mergeProfile(profile) {
  if (!profile) return defaultProfile;

  return {
    ...defaultProfile,
    ...profile,
    background_overlay_opacity: Number(
      profile.background_overlay_opacity ?? 0.72
    ),
  };
}

function mergeContacts(contacts) {
  return {
    ...defaultContacts,
    ...(contacts || {}),
  };
}

function getAdvantages(data) {
  return (data?.advantages || []).map((item) => item.text || item.title);
}

function getServiceIcon(iconName) {
  const className = "h-7 w-7";

  switch (iconName) {
    case "dna":
      return <Dna className={className} />;
    case "graduation":
      return <GraduationCap className={className} />;
    case "book":
      return <BookOpen className={className} />;
    case "microscope":
      return <Microscope className={className} />;
    case "atom":
      return <Atom className={className} />;
    case "flask":
    default:
      return <FlaskConical className={className} />;
  }
}

function getServiceVisual(iconName) {
  if (iconName === "dna") {
    return (
      <div className="relative h-20 overflow-hidden rounded-3xl border border-emerald-300/15 bg-emerald-300/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(110,231,183,0.35),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(103,232,249,0.22),transparent_35%)]" />

        <motion.div
          animate={{ x: [0, 18, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-4 top-4 h-12 w-12 rounded-full border-2 border-emerald-200/60"
        />

        <motion.div
          animate={{ x: [0, -18, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-4 bottom-4 h-12 w-12 rounded-full border-2 border-cyan-200/60"
        />

        <Dna className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-emerald-100" />
      </div>
    );
  }

  if (iconName === "graduation") {
    return (
      <div className="relative h-20 overflow-hidden rounded-3xl border border-blue-300/15 bg-blue-300/10">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(147,197,253,0.28),transparent),radial-gradient(circle_at_80%_20%,rgba(103,232,249,0.28),transparent_35%)]" />

        <div className="absolute bottom-4 left-5 h-3 w-20 rounded-full bg-blue-100/30" />
        <div className="absolute bottom-8 left-5 h-3 w-28 rounded-full bg-cyan-100/30" />
        <div className="absolute bottom-12 left-5 h-3 w-16 rounded-full bg-white/30" />

        <GraduationCap className="absolute right-5 top-5 h-10 w-10 text-blue-100" />
      </div>
    );
  }

  if (iconName === "book") {
    return (
      <div className="relative h-20 overflow-hidden rounded-3xl border border-cyan-300/15 bg-cyan-300/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(103,232,249,0.3),transparent_35%),linear-gradient(135deg,transparent,rgba(255,255,255,0.08))]" />

        <div className="absolute left-5 top-5 h-11 w-8 rounded-lg border border-cyan-100/40 bg-cyan-100/20" />
        <div className="absolute left-14 top-5 h-11 w-8 rounded-lg border border-emerald-100/40 bg-emerald-100/20" />
        <div className="absolute left-24 top-5 h-11 w-8 rounded-lg border border-blue-100/40 bg-blue-100/20" />

        <BookOpen className="absolute right-5 top-5 h-10 w-10 text-cyan-100" />
      </div>
    );
  }

  if (iconName === "microscope") {
    return (
      <div className="relative h-20 overflow-hidden rounded-3xl border border-violet-300/15 bg-violet-300/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(196,181,253,0.33),transparent_35%),radial-gradient(circle_at_25%_80%,rgba(103,232,249,0.2),transparent_35%)]" />

        <Microscope className="absolute left-5 top-5 h-10 w-10 text-violet-100" />
        <div className="absolute right-5 top-6 h-4 w-4 rounded-full bg-cyan-200/70" />
        <div className="absolute right-12 top-10 h-2.5 w-2.5 rounded-full bg-emerald-200/70" />
        <div className="absolute right-8 bottom-5 h-3 w-3 rounded-full bg-white/60" />
      </div>
    );
  }

  if (iconName === "atom") {
    return (
      <div className="relative h-20 overflow-hidden rounded-3xl border border-cyan-300/15 bg-cyan-300/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(103,232,249,0.28),transparent_38%)]" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/50"
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-8 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-100/50"
        />

        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100" />
      </div>
    );
  }

  return (
    <div className="relative h-20 overflow-hidden rounded-3xl border border-cyan-300/15 bg-cyan-300/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(103,232,249,0.35),transparent_35%),radial-gradient(circle_at_80%_75%,rgba(110,231,183,0.25),transparent_35%)]" />

      <div className="absolute left-6 top-5 h-11 w-8 rounded-b-2xl rounded-t-lg border border-cyan-100/50 bg-cyan-100/20" />
      <div className="absolute left-7 top-9 h-5 w-6 rounded-b-xl bg-cyan-200/45" />
      <div className="absolute left-8 top-3 h-3 w-4 rounded-t-md border border-cyan-100/50" />

      <motion.div
        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-8 top-6 h-3 w-3 rounded-full bg-emerald-200"
      />

      <motion.div
        animate={{ y: [0, -7, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-14 bottom-6 h-2.5 w-2.5 rounded-full bg-cyan-200"
      />

      <FlaskConical className="absolute right-5 top-5 h-10 w-10 text-cyan-100" />
    </div>
  );
}

function SectionTitle({ badge, title, text }) {
  return (
    <motion.div
      {...sectionMotion}
      className="mx-auto mb-12 max-w-3xl text-center"
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200">
        <Sparkles className="h-4 w-4" />
        {badge}
      </div>

      <h2 className="text-3xl font-black tracking-tight text-white md:text-5xl">
        {title}
      </h2>

      <p className="mt-4 text-base leading-7 text-slate-300 md:text-lg">
        {text}
      </p>
    </motion.div>
  );
}

function FloatingScienceDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[1] hidden overflow-hidden lg:block">
      <motion.div
        animate={{ y: [0, -28, 0], rotate: [0, 12, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-[5%] top-[18%] rounded-3xl border border-cyan-300/15 bg-cyan-300/5 p-4 text-cyan-200 backdrop-blur-xl"
      >
        <Atom className="h-8 w-8" />
      </motion.div>

      <motion.div
        animate={{ y: [0, 34, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[6%] top-[34%] rounded-3xl border border-emerald-300/15 bg-emerald-300/5 p-4 text-emerald-200 backdrop-blur-xl"
      >
        <Dna className="h-8 w-8" />
      </motion.div>

      <motion.div
        animate={{ y: [0, -22, 0], x: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[18%] left-[8%] rounded-3xl border border-white/10 bg-white/5 p-4 text-cyan-200 backdrop-blur-xl"
      >
        <Microscope className="h-8 w-8" />
      </motion.div>
    </div>
  );
}

function ScienceOrbit() {
  return (
    <div className="science-orbit pointer-events-none absolute -right-8 top-8 hidden h-44 w-44 lg:block">
      <div className="science-orbit-ring science-orbit-ring-one" />
      <div className="science-orbit-ring science-orbit-ring-two" />
      <div className="science-orbit-core">
        <Atom className="h-7 w-7" />
      </div>
      <div className="science-orbit-dot science-orbit-dot-one" />
      <div className="science-orbit-dot science-orbit-dot-two" />
    </div>
  );
}

function HeroInsightPanel({ profile, contacts }) {
  const cityText = contacts.address || contacts.city || "Онлайн-занятия";

  return (
    <div className="premium-panel absolute -left-16 top-14 z-30 hidden max-w-[250px] p-4 xl:-left-24 lg:block">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300/10 text-cyan-200">
          <Microscope className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
            Формат
          </p>
          <p className="text-sm font-semibold text-white">{cityText}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-lg font-black text-cyan-200">
            {profile.experience_value}
          </p>
          <p className="mt-1 text-xs leading-4 text-slate-400">
            {profile.experience_label}
          </p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-lg font-black text-emerald-200">
            {profile.materials_value}
          </p>
          <p className="mt-1 text-xs leading-4 text-slate-400">
            {profile.materials_label}
          </p>
        </div>
      </div>
    </div>
  );
}

function UserPhotoPlaceholder() {
  return (
    <div>
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/10">
        <Microscope className="h-12 w-12 text-cyan-200" />
      </div>

      <h3 className="mt-6 text-2xl font-black">Место для фото</h3>

      <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
        Загрузи фото преподавателя в админке: “Основная информация” → “Фото
        преподавателя”.
      </p>
    </div>
  );
}

function Home() {
  const [cachedSiteData] = useState(() => readCachedSiteData());
  const [hasDisplayData, setHasDisplayData] = useState(Boolean(cachedSiteData));

  const [profile, setProfile] = useState(() =>
    mergeProfile(cachedSiteData?.profile)
  );
  const [advantages, setAdvantages] = useState(() =>
    getAdvantages(cachedSiteData)
  );
  const [services, setServices] = useState(() => cachedSiteData?.services || []);
  const [materials, setMaterials] = useState(
    () => cachedSiteData?.materials || []
  );
  const [achievements, setAchievements] = useState(
    () => cachedSiteData?.achievements || []
  );
  const [reviews, setReviews] = useState(() => cachedSiteData?.reviews || []);
  const [gallery, setGallery] = useState(() => cachedSiteData?.gallery || []);
  const [contacts, setContacts] = useState(() =>
    mergeContacts(cachedSiteData?.contacts)
  );
  const [loading, setLoading] = useState(!cachedSiteData);
  const [loadError, setLoadError] = useState("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const loadSiteData = useCallback(async () => {
    try {
      const data = await loadSiteDataFromApi();

      setProfile(mergeProfile(data.profile));
      setAdvantages(getAdvantages(data));
      setServices(data.services || []);
      setMaterials(data.materials || []);
      setAchievements(data.achievements || []);
      setReviews(data.reviews || []);
      setGallery(data.gallery || []);
      setContacts(mergeContacts(data.contacts));

      writeCachedSiteData(data);
      setHasDisplayData(true);
      setLoadError("");
    } catch (error) {
      console.error("Ошибка загрузки данных сайта через Vercel API:", error);
      setLoadError("Не удалось загрузить актуальные данные сайта.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSiteData();

    const interval = setInterval(() => {
      loadSiteData();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [loadSiteData]);

  useEffect(() => {
    function handleScroll() {
      setShowBackTop(window.scrollY > 700);

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

      setScrollProgress(Math.min(Math.max(nextProgress, 0), 1));
    }

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const phoneHref = contacts.phone
    ? `tel:${contacts.phone.replace(/[^\d+]/g, "")}`
    : "#";

  const emailHref = contacts.email ? `mailto:${contacts.email}` : "#";
  const telegramHref = normalizeTelegramUrl(contacts.telegram_url);
  const whatsappHref = safeExternalUrl(contacts.whatsapp_url);
  const mapHref = safeExternalUrl(contacts.map_url);

  const overlayOpacity = Number(profile.background_overlay_opacity ?? 0.72);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!hasDisplayData) {
    return (
      <main className="site-canvas flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
        <div className="premium-panel max-w-xl p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-200">
            <Atom className="h-8 w-8" />
          </div>

          <h1 className="text-3xl font-black">
            Загружаем актуальные данные сайта
          </h1>

          <p className="mt-4 leading-7 text-slate-300">
            Сайт получает последние тексты, контакты и разделы из базы данных.
          </p>

          {loadError && !loading && (
            <p className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {loadError}
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="site-canvas min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="fixed left-0 top-0 z-[70] h-1 w-full bg-slate-950/40">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-blue-300"
          style={{ scaleX: scrollProgress, transformOrigin: "0% 50%" }}
        />
      </div>

      {profile.background_image_url && (
        <div className="pointer-events-none fixed inset-0 z-[-2]">
          <img
            src={profile.background_image_url}
            alt=""
            className="h-full w-full object-cover"
          />

          <div
            className="absolute inset-0 bg-slate-950"
            style={{ opacity: overlayOpacity }}
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(103,232,249,0.22),transparent_34%),radial-gradient(circle_at_80%_30%,rgba(110,231,183,0.18),transparent_34%),linear-gradient(to_bottom,rgba(2,6,23,0.2),rgba(2,6,23,0.92))]" />
        </div>
      )}

      <FloatingScienceDecor />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(14,165,233,0.10),transparent_28%,rgba(16,185,129,0.08)_52%,transparent_78%),linear-gradient(to_bottom,rgba(15,23,42,0.24),rgba(2,6,23,0.94))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-6">
          <a href="#" className="flex items-center gap-3" onClick={closeMenu}>
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/15 ring-1 ring-cyan-300/30"
            >
              <Atom className="h-6 w-6 text-cyan-200" />
            </motion.div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                Учитель
              </p>
              <p className="font-semibold text-white">
                Химия &amp; Биология
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm text-slate-300 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 transition hover:bg-white/8 hover:text-cyan-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#contacts"
              className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200"
            >
              Связаться
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white md:hidden"
            aria-label="Открыть меню"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-xl md:hidden"
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              className="ml-auto flex h-full w-[86%] max-w-sm flex-col border-l border-white/10 bg-slate-950 p-6"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/30">
                    <Atom className="h-6 w-6 text-cyan-200" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Меню сайта</p>
                    <p className="font-semibold text-white">Science CMS</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5"
                  aria-label="Закрыть меню"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-slate-200"
                  >
                    <span>{link.label}</span>
                    <ChevronRight className="h-5 w-5 text-cyan-200" />
                  </a>
                ))}
              </nav>

              <a
                href="#contacts"
                onClick={closeMenu}
                className="mt-6 rounded-full bg-cyan-300 px-6 py-4 text-center font-bold text-slate-950"
              >
                Связаться
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative z-10 px-5 py-16 sm:px-6 md:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:min-h-[calc(100vh-84px)] lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
                Индивидуальный подход
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                Химия
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                Биология
              </span>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.55 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200 shadow-lg shadow-emerald-950/20"
            >
              <Microscope className="h-4 w-4" />
              {profile.hero_badge}
            </motion.div>

            <h1 className="max-w-4xl text-4xl font-black leading-[1.04] tracking-tight text-white sm:text-5xl md:text-7xl">
              {profile.full_name}{" "}
              <span className="mt-3 block text-3xl leading-tight text-slate-100 md:text-5xl">
                {profile.hero_title}{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-emerald-200 to-blue-200 bg-clip-text text-transparent">
                  {profile.hero_highlight}
                </span>
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl md:leading-9">
              {profile.hero_description}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <motion.a
                whileHover={{ y: -3, scale: 1.02 }}
                href="#contacts"
                className="rounded-full bg-cyan-300 px-7 py-4 text-center font-bold text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:bg-cyan-200"
              >
                Записаться на занятие
              </motion.a>

              <motion.a
                whileHover={{ y: -3, scale: 1.02 }}
                href="#materials"
                className="rounded-full border border-white/15 bg-white/5 px-7 py-4 text-center font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                Посмотреть материалы
              </motion.a>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                [profile.experience_value, profile.experience_label],
                [profile.materials_value, profile.materials_label],
                [profile.access_value, profile.access_label],
              ].map(([value, label], index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + index * 0.08, duration: 0.5 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
                >
                  <p
                    className={
                      index === 0
                        ? "text-3xl font-black text-cyan-200"
                        : index === 1
                          ? "text-3xl font-black text-emerald-200"
                          : "text-3xl font-black text-blue-200"
                    }
                  >
                    {value}
                  </p>
                  <p className="mt-1 text-sm leading-5 text-slate-400">{label}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                ["01", "Разбор темы простым языком"],
                ["02", "Схемы, задания и практика"],
                ["03", "Подготовка к проверочным"],
              ].map(([number, text]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 backdrop-blur"
                >
                  <p className="text-xs font-bold text-cyan-200">{number}</p>
                  <p className="mt-2 text-sm leading-5 text-slate-300">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="relative lg:justify-self-end"
          >
            <div className="relative mx-auto max-w-lg">
              <ScienceOrbit />
              <HeroInsightPanel profile={profile} contacts={contacts} />

              <div className="absolute -inset-x-6 -inset-y-8 z-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(103,232,249,0.18),rgba(110,231,183,0.08),rgba(147,197,253,0.16))] blur-2xl" />

              <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/12 bg-white/10 p-3 shadow-2xl backdrop-blur-2xl">
                <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-900/70">
                  <div className="data-stream absolute inset-x-0 top-0 z-10 h-24 opacity-70" />

                  {profile.hero_photo_url ? (
                    <img
                      src={profile.hero_photo_url}
                      alt={profile.full_name}
                      className="h-[460px] w-full object-cover sm:h-[560px]"
                    />
                  ) : (
                    <div className="flex h-[460px] w-full flex-col items-center justify-center bg-gradient-to-br from-cyan-300/20 via-emerald-300/10 to-blue-300/20 p-8 text-center sm:h-[560px]">
                      <UserPhotoPlaceholder />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-slate-950/72 p-5 backdrop-blur-xl">
                    <p className="text-sm text-cyan-200">{profile.profession}</p>
                    <p className="mt-1 text-2xl font-black">
                      {profile.full_name}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {profile.science_card_title}
                    </p>
                  </div>

                  <motion.div
                    animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute -right-3 top-8 rounded-3xl bg-cyan-300 p-5 text-slate-950 shadow-xl"
                  >
                    <Atom className="h-9 w-9" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
                    transition={{ duration: 5.5, repeat: Infinity }}
                    className="absolute -left-3 bottom-28 rounded-3xl bg-emerald-300 p-5 text-slate-950 shadow-xl"
                  >
                    <Dna className="h-9 w-9" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        id="about"
        {...sectionMotion}
        className="relative z-10 px-5 py-18 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Обо мне"
            title={profile.about_title}
            text={profile.about_text}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div
              whileHover={{ y: -6 }}
              className="premium-panel p-7 md:p-8"
            >
              <h3 className="text-2xl font-bold">{profile.approach_title}</h3>

              <p className="mt-4 leading-8 text-slate-300">
                {profile.approach_text}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="premium-panel p-7 md:p-8"
            >
              <h3 className="text-2xl font-bold">Что получает ученик</h3>

              <div className="mt-5 space-y-4">
                {advantages.length > 0 ? (
                  advantages.map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="flex gap-3"
                    >
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-200" />
                      <p className="text-slate-300">{item}</p>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-slate-400">
                    Преимущества пока не добавлены.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="services"
        {...sectionMotion}
        className="relative z-10 px-5 py-18 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Направления"
            title="Чем я могу помочь"
            text="Направления работы, которые можно редактировать через админ-панель."
          />

          {services.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="Направления пока не добавлены"
              text="Добавьте услуги в админ-панели, и блок сразу станет готовой витриной занятий."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.id || service.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="premium-card group overflow-hidden p-5 transition hover:border-cyan-300/30"
                >
                  {getServiceVisual(service.icon)}

                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                      {getServiceIcon(service.icon)}
                    </div>

                    <h3 className="text-xl font-bold">{service.title}</h3>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {service.text}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        id="materials"
        {...sectionMotion}
        className="relative z-10 px-5 py-18 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Материалы"
            title="Полезные учебные материалы"
            text="Материалы добавляются через админ-панель и автоматически появляются на сайте."
          />

          {loading && (
            <p className="mb-6 text-center text-slate-400">
              Загружаем данные сайта...
            </p>
          )}

          {materials.length === 0 && !loading ? (
            <EmptyState
              icon={BookOpen}
              title="Материалы пока не опубликованы"
              text="Здесь удобно показывать конспекты, таблицы и ссылки, когда они появятся в админке."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {materials.map((item, index) => {
                const materialUrl = safeExternalUrl(item.link_url);

                return (
                  <motion.div
                    key={item.id || item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.55 }}
                    whileHover={{ y: -8 }}
                    className="premium-card p-6"
                  >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <span className="rounded-full bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
                    {item.subject}
                  </span>

                  {item.grade && (
                    <span className="text-sm text-slate-400">
                      {item.grade}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-bold">{item.title}</h3>

                {item.description && (
                  <p className="mt-4 leading-7 text-slate-300">
                    {item.description}
                  </p>
                )}

                {materialUrl ? (
                  <a
                    href={materialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Открыть материал
                    <ChevronRight className="h-4 w-4" />
                  </a>
                ) : (
                  <span className="mt-6 inline-block rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400">
                    Материал без ссылки
                  </span>
                )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        id="achievements"
        {...sectionMotion}
        className="relative z-10 px-5 py-18 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Достижения"
            title="Опыт, развитие и результаты"
            text="Сертификаты, методические разработки, участие в проектах и образовательные достижения."
          />

          {achievements.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Достижения пока не добавлены"
              text="Этот блок можно превратить в сильное доверительное доказательство: сертификаты, проекты и результаты учеников."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id || achievement.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="premium-card p-6"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200">
                    <Trophy className="h-7 w-7" />
                  </div>

                  {achievement.year && (
                    <p className="mb-2 text-sm text-cyan-200">
                      {achievement.year}
                    </p>
                  )}

                  <h3 className="text-xl font-bold">{achievement.title}</h3>

                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {achievement.text || achievement.description}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        id="gallery"
        {...sectionMotion}
        className="relative z-10 px-5 py-18 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Галерея"
            title="Фото из учебной практики"
            text="Здесь можно показать кабинет, уроки, проекты, мероприятия, лабораторные работы и учебные материалы."
          />

          {gallery.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title="Фотографии пока не добавлены"
              text="Когда появятся снимки кабинета, уроков или проектов, они аккуратно лягут в эту сетку."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {gallery.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="premium-card group overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title || "Фото галереи"}
                      className="h-72 w-full object-cover transition duration-700 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />

                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-slate-950/70 px-4 py-2 text-sm text-cyan-100 backdrop-blur">
                      <ImageIcon className="h-4 w-4" />
                      Фото
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold">
                      {item.title || "Без названия"}
                    </h3>

                    {item.description && (
                      <p className="mt-3 text-sm leading-7 text-slate-300">
                        {item.description}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        {...sectionMotion}
        className="relative z-10 px-5 py-18 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Отзывы"
            title="Что говорят ученики и родители"
            text="Отзывы помогают показать подход к обучению и реальные результаты."
          />

          <div className="grid gap-5 md:grid-cols-2">
            {reviews.map((review, index) => {
              const rating = Math.min(Math.max(Number(review.rating || 5), 1), 5);

              return (
                <motion.div
                  key={review.id || review.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="premium-card p-7 md:p-8"
                >
                  <div className="mb-4 flex gap-1 text-yellow-200">
                    {Array.from({ length: rating }).map((_, starIndex) => (
                      <Star
                        key={starIndex}
                        className="h-5 w-5 fill-current"
                      />
                    ))}
                  </div>

                  <p className="leading-8 text-slate-300">“{review.text}”</p>

                  <p className="mt-5 font-bold text-white">{review.name}</p>

                  {review.role && (
                    <p className="mt-1 text-sm text-slate-400">
                      {review.role}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="contacts"
        {...sectionMotion}
        className="relative z-10 px-5 py-18 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="premium-panel overflow-hidden p-7 md:p-12">
            <div className="grid gap-10 md:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
                  <MessageCircle className="h-4 w-4" />
                  Контакты
                </div>

                <h2 className="text-3xl font-black md:text-5xl">
                  Запишитесь на занятие или задайте вопрос
                </h2>

                <p className="mt-5 leading-8 text-slate-300">
                  Напишите удобным способом, и мы обсудим цель занятий, уровень
                  подготовки и подходящий формат обучения.
                </p>
              </div>

              <div className="space-y-4">
                {contacts.phone && (
                  <a
                    href={phoneHref}
                    className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                  >
                    <Phone className="h-6 w-6 text-cyan-200" />
                    <span>{contacts.phone}</span>
                  </a>
                )}

                {contacts.email && (
                  <a
                    href={emailHref}
                    className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                  >
                    <Mail className="h-6 w-6 text-cyan-200" />
                    <span>{contacts.email}</span>
                  </a>
                )}

                {(contacts.city || contacts.address) && (
                  <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                    <MapPin className="h-6 w-6 text-cyan-200" />
                    <span>{contacts.address || contacts.city}</span>
                  </div>
                )}

                {telegramHref && (
                  <a
                    href={telegramHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-7 py-4 text-center font-bold text-slate-950 transition hover:bg-cyan-200"
                  >
                    <Send className="h-5 w-5" />
                    Написать в Telegram
                  </a>
                )}

                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-full border border-emerald-300/30 bg-emerald-300/10 px-7 py-4 text-center font-bold text-emerald-100 transition hover:bg-emerald-300/20"
                  >
                    Написать в WhatsApp
                  </a>
                )}

                {mapHref && (
                  <a
                    href={mapHref}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-full border border-white/10 px-7 py-4 text-center font-bold text-white transition hover:bg-white/10"
                  >
                    Открыть карту
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
          <p>© 2026 {profile.profession}</p>
          <p></p>
        </div>
      </footer>

      <AnimatePresence>
        {showBackTop && (
          <motion.button
            type="button"
            onClick={scrollTop}
            initial={{ opacity: 0, scale: 0.8, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 18 }}
            className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-cyan-300 text-slate-950 shadow-2xl transition hover:bg-cyan-200"
            aria-label="Наверх"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  );
}

export default Home;
