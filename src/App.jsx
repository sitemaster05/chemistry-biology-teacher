import { motion } from "framer-motion";
import {
  Atom,
  Dna,
  FlaskConical,
  Microscope,
  GraduationCap,
  BookOpen,
  Star,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Beaker,
  Sparkles,
} from "lucide-react";

const services = [
  {
    icon: <FlaskConical />,
    title: "Химия",
    text: "Объяснение сложных тем простым языком: атомы, реакции, растворы, органическая химия.",
  },
  {
    icon: <Dna />,
    title: "Биология",
    text: "Клетка, организм человека, генетика, экология и подготовка к контрольным работам.",
  },
  {
    icon: <GraduationCap />,
    title: "Подготовка к экзаменам",
    text: "Системная подготовка, повторение тем, тесты, разбор типичных ошибок.",
  },
  {
    icon: <BookOpen />,
    title: "Учебные материалы",
    text: "Конспекты, таблицы, схемы, задания и полезные материалы для учеников.",
  },
];

const advantages = [
  "Индивидуальный подход к каждому ученику",
  "Понятное объяснение сложных тем",
  "Современные материалы и наглядные схемы",
  "Подготовка к контрольным, олимпиадам и экзаменам",
  "Практические примеры из жизни и науки",
];

const materials = [
  {
    subject: "Химия",
    title: "Строение атома",
    grade: "8 класс",
    description: "Краткий конспект с основными понятиями и схемой строения атома.",
  },
  {
    subject: "Биология",
    title: "Строение клетки",
    grade: "7 класс",
    description: "Материал по органоидам клетки, их функциям и отличиям клеток.",
  },
  {
    subject: "Химия",
    title: "Типы химических реакций",
    grade: "8–9 класс",
    description: "Таблица с примерами реакций соединения, разложения, замещения и обмена.",
  },
];

const reviews = [
  {
    name: "Ученик 9 класса",
    text: "Темы стали понятнее, особенно химические реакции и задачи. Очень помогли схемы и разбор ошибок.",
  },
  {
    name: "Родитель ученика",
    text: "Ребенок стал увереннее на уроках, улучшились оценки и появился интерес к предмету.",
  },
];

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

function App() {
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
              <p className="font-semibold text-white">Химия & Биология</p>
            </div>
          </a>

          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <a href="#about" className="hover:text-cyan-200">Обо мне</a>
            <a href="#services" className="hover:text-cyan-200">Направления</a>
            <a href="#materials" className="hover:text-cyan-200">Материалы</a>
            <a href="#contacts" className="hover:text-cyan-200">Контакты</a>
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
              Современное обучение химии и биологии
            </div>

            <h1 className="text-4xl font-black leading-tight tracking-tight md:text-7xl">
              Алиосманова Кристина Учитель{" "}
              <span className="bg-gradient-to-r from-cyan-200 via-emerald-200 to-blue-200 bg-clip-text text-transparent">
                химии и биологии
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Помогаю ученикам понимать сложные темы простым языком,
              готовиться к урокам, контрольным, олимпиадам и экзаменам.
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

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-3xl font-black text-cyan-200">5+</p>
                <p className="text-sm text-slate-400">лет опыта</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-3xl font-black text-emerald-200">100+</p>
                <p className="text-sm text-slate-400">материалов</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-3xl font-black text-blue-200">24/7</p>
                <p className="text-sm text-slate-400">доступ к сайту</p>
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
                    Наука может быть понятной
                  </h3>
                  <p className="mt-4 text-slate-300">
                    Химия и биология становятся интереснее, когда ученик видит
                    связь между формулами, клетками, реакциями и реальной жизнью.
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
            title="Обучение с понятной структурой"
            text="Главная цель — не просто выучить параграф, а действительно понять тему, увидеть логику и научиться применять знания."
          />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h3 className="text-2xl font-bold">Мой подход</h3>
              <p className="mt-4 leading-8 text-slate-300">
                Я объясняю химию и биологию через схемы, примеры, визуальные
                образы и практические задания. Для каждого ученика подбираю
                темп и формат занятий, чтобы материал был понятным и полезным.
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
            text="Разделы можно будет редактировать через админ-панель: добавлять новые направления, менять описание и порядок карточек."
          />

          <div className="grid gap-6 md:grid-cols-4">
            {services.map((service) => (
              <motion.div
                key={service.title}
                whileHover={{ y: -8 }}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-cyan-300/30"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                  {service.icon}
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
            text="Позже здесь будут материалы из базы данных Supabase, которые можно добавлять и удалять через админку."
          />

          <div className="grid gap-6 md:grid-cols-3">
            {materials.map((item) => (
              <div
                key={item.title}
                className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="rounded-full bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
                    {item.subject}
                  </span>
                  <span className="text-sm text-slate-400">{item.grade}</span>
                </div>
                <h3 className="text-2xl font-bold">{item.title}</h3>
                <p className="mt-4 leading-7 text-slate-300">
                  {item.description}
                </p>
                <button className="mt-6 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Подробнее
                </button>
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
            text="Отзывы также будут редактироваться через админ-панель."
          />

          <div className="grid gap-6 md:grid-cols-2">
            {reviews.map((review) => (
              <div
                key={review.name}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
              >
                <div className="mb-4 flex gap-1 text-yellow-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <p className="leading-8 text-slate-300">“{review.text}”</p>
                <p className="mt-5 font-bold text-white">{review.name}</p>
              </div>
            ))}
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
                  Напишите удобным способом, и мы обсудим цель занятий,
                  уровень подготовки и подходящий формат обучения.
                </p>
              </div>

              <div className="space-y-4">
                <a
                  href="tel:+79999999999"
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <Phone className="h-6 w-6 text-cyan-200" />
                  <span>+7 999 999-99-99</span>
                </a>
                <a
                  href="mailto:teacher@example.com"
                  className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <Mail className="h-6 w-6 text-cyan-200" />
                  <span>teacher@example.com</span>
                </a>
                <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <MapPin className="h-6 w-6 text-cyan-200" />
                  <span>Ваш город / онлайн-занятия</span>
                </div>
                <a
                  href="https://t.me/"
                  className="block rounded-full bg-cyan-300 px-7 py-4 text-center font-bold text-slate-950 transition hover:bg-cyan-200"
                >
                  Написать в Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-sm text-slate-400 md:flex-row">
          <p>© 2026 Учитель химии и биологии</p>
          <p>Сайт-визитка с будущей админ-панелью</p>
        </div>
      </footer>
    </main>
  );
}

export default App;