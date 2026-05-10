import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "../lib/supabase";
import {
  Atom,
  Award,
  Beaker,
  BookOpen,
  CheckCircle2,
  Dna,
  FlaskConical,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Microscope,
  Phone,
  Sparkles,
  Star,
  Trophy,
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

const defaultAdvantages = [
  "Индивидуальный подход к каждому ученику",
  "Понятное объяснение сложных тем",
  "Современные материалы и наглядные схемы",
  "Подготовка к контрольным, олимпиадам и экзаменам",
  "Практические примеры из жизни и науки",
];

const defaultServices = [
  {
    id: "service-1",
    icon: "flask",
    title: "Химия",
    text: "Объяснение сложных тем простым языком: атомы, реакции, растворы, органическая химия.",
  },
  {
    id: "service-2",
    icon: "dna",
    title: "Биология",
    text: "Клетка, организм человека, генетика, экология и подготовка к контрольным работам.",
  },
  {
    id: "service-3",
    icon: "graduation",
    title: "Подготовка к экзаменам",
    text: "Системная подготовка, повторение тем, тесты, разбор типичных ошибок.",
  },
  {
    id: "service-4",
    icon: "book",
    title: "Учебные материалы",
    text: "Конспекты, таблицы, схемы, задания и полезные материалы для учеников.",
  },
];

const defaultMaterials = [
  {
    id: "material-1",
    subject: "Химия",
    title: "Строение атома",
    grade: "8 класс",
    description:
      "Краткий конспект с основными понятиями и схемой строения атома.",
    link_url: "",
  },
  {
    id: "material-2",
    subject: "Биология",
    title: "Строение клетки",
    grade: "7 класс",
    description:
      "Материал по органоидам клетки, их функциям и отличиям клеток.",
    link_url: "",
  },
  {
    id: "material-3",
    subject: "Химия",
    title: "Типы химических реакций",
    grade: "8–9 класс",
    description:
      "Таблица с примерами реакций соединения, разложения, замещения и обмена.",
    link_url: "",
  },
];

const defaultAchievements = [
  {
    id: "achievement-1",
    title: "Современные методики обучения",
    text: "Использование наглядных схем, интерактивных заданий и индивидуального подхода.",
    year: "2026",
  },
  {
    id: "achievement-2",
    title: "Подготовка учебных материалов",
    text: "Авторские конспекты, таблицы и задания для закрепления тем по химии и биологии.",
    year: "2026",
  },
  {
    id: "achievement-3",
    title: "Проектная деятельность",
    text: "Помощь ученикам в подготовке учебных проектов, докладов и исследовательских работ.",
    year: "2026",
  },
];

const defaultReviews = [
  {
    id: "review-1",
    name: "Ученик 9 класса",
    text: "Темы стали понятнее, особенно химические реакции и задачи. Очень помогли схемы и разбор ошибок.",
    rating: 5,
  },
  {
    id: "review-2",
    name: "Родитель ученика",
    text: "Ребенок стал увереннее на уроках, улучшились оценки и появился интерес к предмету.",
    rating: 5,
  },
];

const defaultContacts = {
  phone: "+7 999 999-99-99",
  email: "teacher@example.com",
  telegram_url: "https://t.me/",
  whatsapp_url: "",
  city: "Ваш город / онлайн-занятия",
  address: "",
  map_url: "",
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
    <div className="mx-auto mb-12 max-w-3xl text-center">
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
    </div>
  );
}

function Home() {
  const [profile, setProfile] = useState(defaultProfile);
  const [advantages, setAdvantages] = useState(defaultAdvantages);
  const [services, setServices] = useState(defaultServices);
  const [materials, setMaterials] = useState(defaultMaterials);
  const [achievements, setAchievements] = useState(defaultAchievements);
  const [reviews, setReviews] = useState(defaultReviews);
  const [contacts, setContacts] = useState(defaultContacts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSiteData() {
      setLoading(true);

      const [
        profileResult,
        advantagesResult,
        servicesResult,
        materialsResult,
        achievementsResult,
        reviewsResult,
        contactsResult,
      ] = await Promise.allSettled([
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

        supabase.from("contacts").select("*").eq("id", "main").maybeSingle(),
      ]);

      if (
        profileResult.status === "fulfilled" &&
        !profileResult.value.error &&
        profileResult.value.data
      ) {
        setProfile({
          ...defaultProfile,
          ...profileResult.value.data,
        });
      }

      if (
        advantagesResult.status === "fulfilled" &&
        !advantagesResult.value.error &&
        advantagesResult.value.data &&
        advantagesResult.value.data.length > 0
      ) {
        setAdvantages(
          advantagesResult.value.data.map((item) => item.text || item.title)
        );
      }

      if (
        servicesResult.status === "fulfilled" &&
        !servicesResult.value.error &&
        servicesResult.value.data &&
        servicesResult.value.data.length > 0
      ) {
        setServices(servicesResult.value.data);
      }

      if (
        materialsResult.status === "fulfilled" &&
        !materialsResult.value.error &&
        materialsResult.value.data &&
        materialsResult.value.data.length > 0
      ) {
        setMaterials(materialsResult.value.data);
      }

      if (
        achievementsResult.status === "fulfilled" &&
        !achievementsResult.value.error &&
        achievementsResult.value.data &&
        achievementsResult.value.data.length > 0
      ) {
        setAchievements(achievementsResult.value.data);
      }

      if (
        reviewsResult.status === "fulfilled" &&
        !reviewsResult.value.error &&
        reviewsResult.value.data &&
        reviewsResult.value.data.length > 0
      ) {
        setReviews(reviewsResult.value.data);
      }

      if (
        contactsResult.status === "fulfilled" &&
        !contactsResult.value.error &&
        contactsResult.value.data
      ) {
        setContacts({
          ...defaultContacts,
          ...contactsResult.value.data,
        });
      }

      setLoading(false);
    }

    loadSiteData();
  }, []);

  const phoneHref = contacts.phone
    ? `tel:${contacts.phone.replace(/[^\d+]/g, "")}`
    : "#";

  const emailHref = contacts.email ? `mailto:${contacts.email}` : "#";

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-10%] top-[20%] h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[35%] h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <a href="#" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 ring-1 ring-cyan-300/30">
              <Atom className="h-6 w-6 text-cyan-200" />
            </div>

            <div>
              <p className="text-sm text-slate-400">Учитель</p>
              <p className="font-semibold text-white">
                Химия &amp; Биология
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <a href="#about" className="hover:text-cyan-200">
              Обо мне
            </a>
            <a href="#services" className="hover:text-cyan-200">
              Направления
            </a>
            <a href="#materials" className="hover:text-cyan-200">
              Материалы
            </a>
            <a href="#achievements" className="hover:text-cyan-200">
              Достижения
            </a>
            <a href="#contacts" className="hover:text-cyan-200">
              Контакты
            </a>
          </nav>

          <a
            href="#contacts"
            className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            Связаться
          </a>
        </div>
      </header>

      <section className="relative z-10 px-6 py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm text-emerald-200">
              <Microscope className="h-4 w-4" />
              {profile.hero_badge}
            </div>

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
              <a
                href="#contacts"
                className="rounded-full bg-cyan-300 px-7 py-4 text-center font-bold text-slate-950 transition hover:bg-cyan-200"
              >
                Записаться на занятие
              </a>

              <a
                href="#materials"
                className="rounded-full border border-white/15 bg-white/5 px-7 py-4 text-center font-bold text-white backdrop-blur transition hover:bg-white/10"
              >
                Посмотреть материалы
              </a>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-3xl font-black text-cyan-200">
                  {profile.experience_value}
                </p>
                <p className="text-sm text-slate-400">
                  {profile.experience_label}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-3xl font-black text-emerald-200">
                  {profile.materials_value}
                </p>
                <p className="text-sm text-slate-400">
                  {profile.materials_label}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-3xl font-black text-blue-200">
                  {profile.access_value}
                </p>
                <p className="text-sm text-slate-400">
                  {profile.access_label}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative mx-auto aspect-square max-w-lg rounded-[3rem] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="absolute -right-8 -top-8 rounded-3xl bg-cyan-300 p-5 text-slate-950 shadow-xl">
                <Atom className="h-10 w-10" />
              </div>

              <div className="absolute -bottom-8 -left-8 rounded-3xl bg-emerald-300 p-5 text-slate-950 shadow-xl">
                <Dna className="h-10 w-10" />
              </div>

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

      <section id="about" className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Обо мне"
            title={profile.about_title}
            text={profile.about_text}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h3 className="text-2xl font-bold">{profile.approach_title}</h3>

              <p className="mt-4 leading-8 text-slate-300">
                {profile.approach_text}
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h3 className="text-2xl font-bold">Что получает ученик</h3>

              <div className="mt-5 space-y-4">
                {advantages.map((item) => (
                  <div key={item} className="flex gap-3">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-200" />
                    <p className="text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Направления"
            title="Чем я могу помочь"
            text="Направления работы, которые можно будет редактировать через админ-панель."
          />

          <div className="grid gap-6 md:grid-cols-4">
            {services.map((service) => (
              <motion.div
                key={service.id || service.title}
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
      </section>

      <section id="materials" className="relative z-10 px-6 py-20">
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
            {materials.map((item) => (
              <div
                key={item.id || item.title}
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
                    className="mt-6 inline-block rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Открыть материал
                  </a>
                ) : (
                  <span className="mt-6 inline-block rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400">
                    Материал без ссылки
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="achievements" className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Достижения"
            title="Опыт, развитие и результаты"
            text="Сертификаты, методические разработки, участие в проектах и образовательные достижения."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id || achievement.title}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Отзывы"
            title="Что говорят ученики и родители"
            text="Отзывы помогают показать подход к обучению и реальные результаты."
          />

          <div className="grid gap-6 md:grid-cols-2">
            {reviews.map((review) => {
              const rating = Number(review.rating || 5);

              return (
                <div
                  key={review.id || review.name}
                  className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
                >
                  <div className="mb-4 flex gap-1 text-yellow-200">
                    {Array.from({ length: rating }).map((_, index) => (
                      <Star
                        key={index}
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contacts" className="relative z-10 px-6 py-20">
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
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
          <p>© 2026 {profile.profession}</p>
          <p>Сайт-визитка с админ-панелью</p>
        </div>
      </footer>
    </main>
  );
}

export default Home;