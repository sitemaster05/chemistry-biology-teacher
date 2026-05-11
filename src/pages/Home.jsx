import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import {
  ArrowUp,
  Atom,
  Beaker,
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

function SectionTitle({ badge, title, text }) {
  return (
    <motion.div
      {...sectionMotion}
      className="mx-auto mb-12 max-w-3xl text-center"
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
        <Sparkles className="h-4 w-4" />
        {badge}
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
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

function Home() {
  const [profile, setProfile] = useState(defaultProfile);
  const [advantages, setAdvantages] = useState([]);
  const [services, setServices] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [contacts, setContacts] = useState(defaultContacts);
  const [loading, setLoading] = useState(true);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  const loadSiteData = useCallback(async () => {
    try {
      const [
        profileResponse,
        advantagesResponse,
        servicesResponse,
        materialsResponse,
        achievementsResponse,
        reviewsResponse,
        galleryResponse,
        contactsResponse,
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
            "id, title, subject, grade, description, link_url, is_published, created_at"
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

      if (!profileResponse.error && profileResponse.data) {
        setProfile({
          ...defaultProfile,
          ...profileResponse.data,
        });
      }

      if (!advantagesResponse.error) {
        setAdvantages(
          (advantagesResponse.data || []).map((item) => item.text || item.title)
        );
      }

      if (!servicesResponse.error) {
        setServices(servicesResponse.data || []);
      }

      if (!materialsResponse.error) {
        setMaterials(materialsResponse.data || []);
      }

      if (!achievementsResponse.error) {
        setAchievements(achievementsResponse.data || []);
      }

      if (!reviewsResponse.error) {
        setReviews(reviewsResponse.data || []);
      }

      if (!galleryResponse.error) {
        setGallery(galleryResponse.data || []);
      }

      if (!contactsResponse.error && contactsResponse.data) {
        setContacts({
          ...defaultContacts,
          ...contactsResponse.data,
        });
      }
    } catch (error) {
      console.error("Ошибка загрузки данных сайта:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSiteData();

    const interval = setInterval(() => {
      loadSiteData();
    }, 5000);

    const channel = supabase
      .channel("homepage-live-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "site_profile" },
        loadSiteData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "advantages" },
        loadSiteData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        loadSiteData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "materials" },
        loadSiteData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "achievements" },
        loadSiteData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reviews" },
        loadSiteData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gallery" },
        loadSiteData
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        loadSiteData
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [loadSiteData]);

  useEffect(() => {
    function handleScroll() {
      setShowBackTop(window.scrollY > 700);
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

  function closeMenu() {
    setIsMenuOpen(false);
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <FloatingScienceDecor />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-10%] top-[20%] h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[35%] h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-3" onClick={closeMenu}>
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/30"
            >
              <Atom className="h-6 w-6 text-cyan-200" />
            </motion.div>

            <div>
              <p className="text-sm text-slate-400">Учитель</p>
              <p className="font-semibold text-white">
                Химия &amp; Биология
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative hover:text-cyan-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="#contacts"
              className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
            >
              Связаться
            </a>
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white md:hidden"
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

      <section className="relative z-10 px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.55 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200"
            >
              <Microscope className="h-4 w-4" />
              {profile.hero_badge}
            </motion.div>

            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-7xl">
              {profile.full_name}{" "}
              <span className="block text-3xl md:text-5xl">
                {profile.hero_title}{" "}
                <span className="bg-gradient-to-r from-cyan-200 via-emerald-200 to-blue-200 bg-clip-text text-transparent">
                  {profile.hero_highlight}
                </span>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              {profile.hero_description}
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <motion.a
                whileHover={{ y: -3, scale: 1.02 }}
                href="#contacts"
                className="rounded-full bg-cyan-300 px-7 py-4 text-center font-bold text-slate-950 transition hover:bg-cyan-200"
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

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
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
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur"
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
                  <p className="text-sm text-slate-400">{label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative mx-auto aspect-square max-w-lg rounded-[3rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <motion.div
                animate={{ y: [0, -12, 0], rotate: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -right-8 -top-8 rounded-3xl bg-cyan-300 p-5 text-slate-950 shadow-xl"
              >
                <Atom className="h-10 w-10" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
                transition={{ duration: 5.5, repeat: Infinity }}
                className="absolute -bottom-8 -left-8 rounded-3xl bg-emerald-300 p-5 text-slate-950 shadow-xl"
              >
                <Dna className="h-10 w-10" />
              </motion.div>

              <div className="flex h-full flex-col justify-between rounded-[2.2rem] border border-white/10 bg-slate-900/80 p-8">
                <div>
                  <div className="mb-8 flex items-center justify-between">
                    <div className="rounded-2xl bg-cyan-300/10 p-4">
                      <Beaker className="h-9 w-9 text-cyan-200" />
                    </div>

                    <div className="rounded-full border border-emerald-300/20 px-4 py-2 text-sm text-emerald-200">
                      Science Lab
                    </div>
                  </div>

                  <h3 className="text-3xl font-black">
                    {profile.science_card_title}
                  </h3>

                  <p className="mt-4 text-slate-300">
                    {profile.science_card_text}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-white/5 p-5">
                    <FlaskConical className="mb-3 h-7 w-7 text-cyan-200" />
                    <p className="font-semibold">Опыты</p>
                    <p className="text-sm text-slate-400">реакции и формулы</p>
                  </div>

                  <div className="rounded-3xl bg-white/5 p-5">
                    <Microscope className="mb-3 h-7 w-7 text-emerald-200" />
                    <p className="font-semibold">Биология</p>
                    <p className="text-sm text-slate-400">клетки и системы</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        id="about"
        {...sectionMotion}
        className="relative z-10 px-6 py-20"
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
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
            >
              <h3 className="text-2xl font-bold">{profile.approach_title}</h3>

              <p className="mt-4 leading-8 text-slate-300">
                {profile.approach_text}
              </p>
            </motion.div>

            <motion.div
              whileHover={{ y: -6 }}
              className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
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
        className="relative z-10 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Направления"
            title="Чем я могу помочь"
            text="Направления работы, которые можно редактировать через админ-панель."
          />

          <div className="grid gap-6 md:grid-cols-4">
            {services.map((service, index) => (
              <motion.div
                key={service.id || service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.55 }}
                whileHover={{ y: -8 }}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-cyan-300/30"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                  {getServiceIcon(service.icon)}
                </div>

                <h3 className="text-xl font-bold">{service.title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {service.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="materials"
        {...sectionMotion}
        className="relative z-10 px-6 py-20"
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

          <div className="grid gap-6 md:grid-cols-3">
            {materials.map((item, index) => (
              <motion.div
                key={item.id || item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.55 }}
                whileHover={{ y: -8 }}
                className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl"
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

                {item.link_url ? (
                  <a
                    href={item.link_url}
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
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="achievements"
        {...sectionMotion}
        className="relative z-10 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Достижения"
            title="Опыт, развитие и результаты"
            text="Сертификаты, методические разработки, участие в проектах и образовательные достижения."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id || achievement.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.55 }}
                whileHover={{ y: -8 }}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
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
        </div>
      </motion.section>

      <motion.section
        id="gallery"
        {...sectionMotion}
        className="relative z-10 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Галерея"
            title="Фото из учебной практики"
            text="Здесь можно показать кабинет, уроки, проекты, мероприятия, лабораторные работы и учебные материалы."
          />

          {gallery.length === 0 ? (
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-center text-slate-400 backdrop-blur-xl">
              Фотографии пока не добавлены.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {gallery.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl"
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
        className="relative z-10 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Отзывы"
            title="Что говорят ученики и родители"
            text="Отзывы помогают показать подход к обучению и реальные результаты."
          />

          <div className="grid gap-6 md:grid-cols-2">
            {reviews.map((review, index) => {
              const rating = Number(review.rating || 5);

              return (
                <motion.div
                  key={review.id || review.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
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
        className="relative z-10 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[3rem] border border-white/10 bg-gradient-to-br from-cyan-300/10 via-white/5 to-emerald-300/10 p-8 backdrop-blur-xl md:p-12">
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

                {contacts.telegram_url && (
                  <a
                    href={contacts.telegram_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-full bg-cyan-300 px-7 py-4 text-center font-bold text-slate-950 transition hover:bg-cyan-200"
                  >
                    Написать в Telegram
                  </a>
                )}

                {contacts.whatsapp_url && (
                  <a
                    href={contacts.whatsapp_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-full border border-emerald-300/30 bg-emerald-300/10 px-7 py-4 text-center font-bold text-emerald-100 transition hover:bg-emerald-300/20"
                  >
                    Написать в WhatsApp
                  </a>
                )}

                {contacts.map_url && (
                  <a
                    href={contacts.map_url}
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
          <p>Сайт-визитка с админ-панелью</p>
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