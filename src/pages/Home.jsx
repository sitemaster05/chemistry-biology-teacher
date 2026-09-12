import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { loadSiteDataFromApi } from "../lib/siteDataApi";
import { normalizeTelegramUrl, safeExternalUrl } from "../lib/contactLinks";
import { supabase } from "../lib/supabase";
import {
  ArrowUp,
  Atom,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Dna,
  Droplets,
  FlaskConical,
  Globe2,
  GraduationCap,
  Image as ImageIcon,
  Leaf,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Microscope,
  Phone,
  Send,
  Sparkles,
  Star,
  Sun,
  TreePine,
  Trophy,
  Wind,
  X,
} from "lucide-react";

/* Полупрозрачный фоновый рисунок для карточек
   Fisher-Yates shuffle + useRef: порядок определяется ОДИН раз при загрузке страницы,
   каждая карточка получает уникальную картинку, при скроле/ре-рендере НЕ меняется. */
const TOTAL_CARD_BGS = 27;
const shuffledCardBgs = (() => {
  const arr = Array.from({ length: TOTAL_CARD_BGS }, (_, i) => i + 1);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
})();
const cardBgIndexRef = { current: 0 };

function CardBg() {
  const [idx] = useState(() => {
    const pos = cardBgIndexRef.current % TOTAL_CARD_BGS;
    cardBgIndexRef.current++;
    return shuffledCardBgs[pos];
  });
  return (
    <div
      className="card-bg-image"
      aria-hidden="true"
      style={{ backgroundImage: `url(/card-bg/card-bg-${idx}.png)` }}
    />
  );
}

const defaultProfile = {
  full_name: "Алиосманова Надира",
  profession: "Учитель химии, биологии, географии и экологии",

  hero_badge: "Химия · Биология · География · Экология",
  hero_title: "Учитель",
  hero_highlight: "естественных наук",
  hero_description:
    "Помогаю ученикам в Каспийске и по всему Дагестану понимать сложные темы простым языком, готовиться к урокам, контрольным, олимпиадам и экзаменам. Занятия — в Каспийске и онлайн.",

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
    "Я объясняю химию, биологию, географию и экологию через схемы, примеры, визуальные образы и практические задания. Для каждого ученика подбираю темп и формат занятий, чтобы материал был понятным и полезным.",

  science_card_title: "Наука может быть понятной",
  science_card_text:
    "Химия, биология, география и экология становятся интереснее, когда ученик видит связь между формулами, клетками, реакциями, природой и реальной жизнью.",

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

const scienceFormulas = [
  "H₂O",
  "CO₂",
  "O₂",
  "O₃",
  "NaCl",
  "C₆H₁₂O₆",
  "NH₃",
  "H₂SO₄",
  "CH₄",
  "Fe₂O₃",
  "KMnO₄",
  "CaCO₃",
  "SiO₂",
  "N₂O",
  "SO₂",
  "АТФ",
  "ДНК",
  "РНК",
  "pH 7.0",
];

/* Витрина предметов в панели героя: у каждой науки — свой цвет,
   набор плиток с данными, факт и бегущая лента. */
const subjectShowcase = [
  {
    id: "chemistry",
    label: "Химия",
    tabIcon: Atom,
    pill: "border-cyan-300/50 bg-cyan-300/15 text-cyan-100",
    badge: "border-cyan-300/25 bg-cyan-300/10 text-cyan-200",
    tileBig: "text-cyan-200",
    header: "Периодическая система",
    title: "Элементы жизни",
    tiles: [
      { top: "1 · 1.008", big: "H", bottom: "Водород" },
      { top: "6 · 12.011", big: "C", bottom: "Углерод" },
      { top: "7 · 14.007", big: "N", bottom: "Азот" },
      { top: "8 · 15.999", big: "O", bottom: "Кислород" },
    ],
    factIcon: FlaskConical,
    factText:
      "В организме человека — около 25 химических элементов таблицы Менделеева",
    ticker: [
      "H₂O",
      "CO₂",
      "O₂",
      "NaCl",
      "C₆H₁₂O₆",
      "NH₃",
      "H₂SO₄",
      "CH₄",
      "KMnO₄",
      "Fe₂O₃",
      "pH 7.0",
    ],
  },
  {
    id: "biology",
    label: "Биология",
    tabIcon: Dna,
    pill: "border-emerald-300/50 bg-emerald-300/15 text-emerald-100",
    badge: "border-emerald-300/25 bg-emerald-300/10 text-emerald-200",
    tileBig: "text-emerald-200",
    header: "Молекулярная биология",
    title: "Код жизни",
    tiles: [
      { top: "пара · Т", big: "А", bottom: "Аденин" },
      { top: "пара · А", big: "Т", bottom: "Тимин" },
      { top: "пара · Ц", big: "Г", bottom: "Гуанин" },
      { top: "пара · Г", big: "Ц", bottom: "Цитозин" },
    ],
    factVisual: "dna",
    factIcon: Dna,
    factText: "ДНК — двойная спираль, в которой записана наследственная информация",
    ticker: [
      "АТФ",
      "РНК",
      "фотосинтез",
      "митоз",
      "геном",
      "белок",
      "фермент",
      "хлорофилл",
      "C₆H₁₂O₆",
      "клетка",
    ],
  },
  {
    id: "geography",
    label: "География",
    tabIcon: Globe2,
    pill: "border-amber-300/50 bg-amber-300/15 text-amber-100",
    badge: "border-amber-300/25 bg-amber-300/10 text-amber-200",
    tileBig: "text-amber-200",
    header: "Координаты",
    title: "Каспийск · Дагестан",
    tiles: [
      { top: "с.ш.", big: "42.9°", bottom: "Каспийск" },
      { top: "в.д.", big: "47.6°", bottom: "Дагестан" },
      { top: "уровень", big: "−28 м", bottom: "Каспий" },
      { top: "высота", big: "4466 м", bottom: "Базардюзю" },
    ],
    factIcon: MapPin,
    factText:
      "Каспийское море — крупнейшее замкнутое озеро планеты, а Дагестан — республика гор и моря",
    ticker: [
      "42.9° с.ш.",
      "47.6° в.д.",
      "Эльбрус 5642 м",
      "Сулакский каньон 1920 м",
      "рельеф",
      "климат",
      "меридиан",
      "параллель",
      "Кавказ",
      "Каспий",
    ],
  },
  {
    id: "ecology",
    label: "Экология",
    tabIcon: Leaf,
    pill: "border-lime-300/50 bg-lime-300/15 text-lime-100",
    badge: "border-lime-300/25 bg-lime-300/10 text-lime-200",
    tileBig: "text-lime-200",
    header: "Компоненты природы",
    title: "Забота о планете",
    tiles: [
      { top: "21% O₂", bigIcon: Wind, bottom: "Воздух" },
      { top: "2,5% пресной", bigIcon: Droplets, bottom: "Вода" },
      { top: "лёгкие планеты", bigIcon: TreePine, bottom: "Леса" },
      { top: "возобновляемая", bigIcon: Sun, bottom: "Энергия" },
    ],
    factIcon: Leaf,
    factText:
      "Кавказ входит в число 36 «горячих точек» биоразнообразия нашей планеты",
    ticker: [
      "биоразнообразие",
      "экосистема",
      "Красная книга",
      "заповедник",
      "раздельный сбор",
      "CO₂ ↓",
      "O₂ ↑",
      "чистая вода",
      "энергосбережение",
      "климат",
    ],
  },
];

// Пузырьки фона: позиция, размер (px), длительность и задержка (сек),
// дрейф по горизонтали (px) и максимальная прозрачность.
const backgroundBubbles = [
  { left: "4%", size: 8, duration: 30, delay: 0, x: 26, opacity: 0.34 },
  { left: "11%", size: 6, duration: 38, delay: 7, x: -18, opacity: 0.26 },
  { left: "18%", size: 12, duration: 46, delay: 14, x: 34, opacity: 0.2 },
  { left: "27%", size: 6, duration: 33, delay: 3, x: -22, opacity: 0.3 },
  { left: "35%", size: 9, duration: 41, delay: 19, x: 18, opacity: 0.24 },
  { left: "44%", size: 6, duration: 36, delay: 10, x: -30, opacity: 0.28 },
  { left: "53%", size: 11, duration: 48, delay: 25, x: 24, opacity: 0.2 },
  { left: "61%", size: 7, duration: 34, delay: 5, x: -16, opacity: 0.3 },
  { left: "69%", size: 13, duration: 50, delay: 16, x: 30, opacity: 0.18 },
  { left: "77%", size: 6, duration: 37, delay: 22, x: -26, opacity: 0.28 },
  { left: "85%", size: 9, duration: 43, delay: 9, x: 20, opacity: 0.24 },
  { left: "93%", size: 6, duration: 31, delay: 28, x: -14, opacity: 0.32 },
];

const sectionMotion = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.7, ease: "easeOut" },
};

// Элементы для мини-карточки в bento-сетке «Обо мне»
const aboutElements = [
  { symbol: "Ca", number: 20, name: "Кальций" },
  { symbol: "P", number: 15, name: "Фосфор" },
  { symbol: "Fe", number: 26, name: "Железо" },
  { symbol: "Mg", number: 12, name: "Магний" },
];

/* Счётчик, который «набегает» до значения при появлении на экране.
   Понимает значения вида «42+», «100+», «24/7». */
function AnimatedCounter({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;

    const raw = String(value ?? "");
    const match = raw.match(/^(\d+)(.*)$/);

    if (!match) {
      setDisplay(raw);
      return;
    }

    const target = Number(match[1]);
    const suffix = match[2];
    const duration = 1500;
    const startedAt = performance.now();
    let frameId;

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setDisplay(`${Math.round(target * eased)}${suffix}`);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}


function SpotlightCard({ className = "", children, ...props }) {
  const ref = useRef(null);

  function handleMouseMove(event) {
    const card = ref.current;

    if (!card) return;

    const rect = card.getBoundingClientRect();

    card.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`spotlight-card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/* Магнитная кнопка: тянется к курсору и плавно возвращается. */
function MagneticButton({ children, className, ...props }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 14, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 180, damping: 14, mass: 0.4 });

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();

    x.set((event.clientX - (rect.left + rect.width / 2)) * 0.16);
    y.set((event.clientY - (rect.top + rect.height / 2)) * 0.22);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      {...props}
    >
      {children}
    </motion.a>
  );
}

/* 3D-наклон элемента за курсором (для научной панели). */
function TiltContainer({ children, className = "" }) {
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springRotateX = useSpring(rotateX, { stiffness: 140, damping: 18 });
  const springRotateY = useSpring(rotateY, { stiffness: 140, damping: 18 });

  function handleMouseMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    rotateY.set(px * 7);
    rotateX.set(-py * 7);
  }

  function handleMouseLeave() {
    rotateX.set(0);
    rotateY.set(0);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        transformPerspective: 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Появление текста по словам — каждое слово «выпрыгивает» из своей маски. */
function RevealWords({ text, className = "", delay = 0 }) {
  const words = String(text ?? "").split(" ").filter(Boolean);

  return (
    <span className={className}>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{
              delay: delay + index * 0.07,
              duration: 0.65,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {word}
            {index < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* Анимированная колба с жидкостью и пузырьками (для bento-карточки). */
function AnimatedFlask() {
  return (
    <div
      className="relative mx-auto flex h-40 w-40 shrink-0 items-center justify-center sm:h-48 sm:w-48"
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.14),transparent_65%)] blur-xl" />

      <svg viewBox="0 0 100 100" className="relative h-full w-full">
        <defs>
          <linearGradient id="flaskLiquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(103, 232, 249, 0.6)" />
            <stop offset="100%" stopColor="rgba(110, 231, 183, 0.3)" />
          </linearGradient>
        </defs>

        {/* Жидкость */}
        <path
          d="M37.5 48 L25.5 69 a6 6 0 0 0 5 9 h39 a6 6 0 0 0 5 -9 L62.5 48 z"
          fill="url(#flaskLiquid)"
        />

        {/* Пузырьки */}
        <circle
          cx="42"
          cy="66"
          r="2.5"
          className="flask-bubble"
          fill="rgba(255,255,255,0.55)"
        />
        <circle
          cx="52"
          cy="61"
          r="1.8"
          className="flask-bubble"
          style={{ animationDelay: "1.1s" }}
          fill="rgba(255,255,255,0.55)"
        />
        <circle
          cx="58"
          cy="68"
          r="2"
          className="flask-bubble"
          style={{ animationDelay: "2.2s" }}
          fill="rgba(255,255,255,0.55)"
        />

        {/* Контур колбы */}
        <path
          d="M42 18 h16 v22 l20 34 a8 8 0 0 1 -7 12 H29 a8 8 0 0 1 -7 -12 l20 -34 z"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Риски на горлышке */}
        <line
          x1="46"
          y1="24"
          x2="54"
          y2="24"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />
        <line
          x1="46"
          y1="30"
          x2="54"
          y2="30"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

/* Контурная бегущая строка дисциплин — лента-разделитель после героя. */
function KnowledgeMarquee() {
  const subjects = [
    "Химия",
    "Биология",
    "География",
    "Экология",
    "Генетика",
    "Органическая химия",
    "Биохимия",
    "Геология",
    "Метеорология",
    "Картография",
    "Ландшафтоведение",
    "Анатомия",
    "Ботаника",
    "Зоология",
    "Физиология",
    "Природоведение",
  ];

  return (
    <div
      className="relative z-10 overflow-hidden border-y border-white/8 bg-slate-950/45 py-4 backdrop-blur-sm sm:py-5"
      aria-hidden="true"
    >
      <div className="formula-track flex w-max items-center whitespace-nowrap">
        {[...subjects, ...subjects].map((subject, index) => (
          <span key={`${subject}-${index}`} className="flex items-center">
            <span className="marquee-outline-text text-xl font-black uppercase tracking-wider sm:text-2xl">
              {subject}
            </span>
            <span className="mx-8 h-1.5 w-1.5 rounded-full bg-cyan-300/35" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* Декоративный разделитель между секциями. */
function SectionDivider() {
  return (
    <div
      className="relative z-10 mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6"
      aria-hidden="true"
    >
      <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/14" />
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/50" />
      <span className="h-2.5 w-2.5 rounded-full border border-cyan-300/40" />
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/50" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/14" />
    </div>
  );
}

function EmptyState({ icon: Icon = Sparkles, title, text }) {
  return (
    <div className="premium-panel mx-auto max-w-3xl p-8 text-center">
              <CardBg />
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

/* Цветовая тема карточки направления — у каждого предмета свой акцент */
function getServiceTheme(iconName) {
  switch (iconName) {
    case "dna":
      return {
        iconBox: "bg-emerald-300/10 text-emerald-200",
        hover: "hover:border-emerald-300/30",
      };
    case "globe":
      return {
        iconBox: "bg-amber-300/10 text-amber-200",
        hover: "hover:border-amber-300/30",
      };
    case "leaf":
      return {
        iconBox: "bg-lime-300/10 text-lime-200",
        hover: "hover:border-lime-300/30",
      };
    case "graduation":
      return {
        iconBox: "bg-blue-300/10 text-blue-200",
        hover: "hover:border-blue-300/30",
      };
    case "microscope":
      return {
        iconBox: "bg-violet-300/10 text-violet-200",
        hover: "hover:border-violet-300/30",
      };
    default:
      return {
        iconBox: "bg-cyan-300/10 text-cyan-200",
        hover: "hover:border-cyan-300/30",
      };
  }
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
    case "globe":
      return <Globe2 className={className} />;
    case "leaf":
      return <Leaf className={className} />;
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

  if (iconName === "globe") {
    return (
      <div className="relative h-20 overflow-hidden rounded-3xl border border-amber-300/15 bg-amber-300/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(252,211,77,0.3),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(110,231,183,0.2),transparent_35%)]" />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-100/50"
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-8 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-100/40"
        />

        <Globe2 className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-amber-100" />

        <div className="absolute right-6 top-6 h-2.5 w-2.5 rounded-full bg-emerald-200/80" />
        <div className="absolute bottom-6 left-6 h-2 w-2 rounded-full bg-cyan-200/70" />
      </div>
    );
  }

  if (iconName === "leaf") {
    return (
      <div className="relative h-20 overflow-hidden rounded-3xl border border-lime-300/15 bg-lime-300/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_75%,rgba(163,230,53,0.3),transparent_38%),radial-gradient(circle_at_75%_25%,rgba(110,231,183,0.25),transparent_35%)]" />

        <Leaf className="absolute left-5 top-5 h-10 w-10 text-lime-100" />

        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute right-6 top-7 h-6 w-6 rounded-full border-2 border-lime-200/60"
        />

        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-5 right-12 h-2.5 w-2.5 rounded-full bg-emerald-200/80"
        />
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

function getSubjectBadgeClass(subject) {
  if (subject === "Биология") {
    return "bg-emerald-300/10 text-emerald-200";
  }

  if (subject === "Химия") {
    return "bg-cyan-300/10 text-cyan-200";
  }

  if (subject === "География") {
    return "bg-amber-300/10 text-amber-200";
  }

  if (subject === "Экология") {
    return "bg-lime-300/10 text-lime-200";
  }

  // Комбинированные предметы — двухцветный градиент входящих наук
  if (subject === "Химия и биология") {
    return "bg-gradient-to-r from-cyan-300/15 to-emerald-300/15 text-cyan-100";
  }

  if (subject === "Биология и география") {
    return "bg-gradient-to-r from-emerald-300/15 to-amber-300/15 text-emerald-100";
  }

  if (subject === "География и экология") {
    return "bg-gradient-to-r from-amber-300/15 to-lime-300/15 text-amber-100";
  }

  if (subject === "Подготовка к экзаменам") {
    return "bg-violet-300/10 text-violet-200";
  }

  return "bg-blue-300/10 text-blue-200";
}

function SectionTitle({ badge, title, text, number }) {
  return (
    <motion.div
      {...sectionMotion}
      className="mx-auto mb-12 max-w-3xl text-center"
    >
      <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-200">
        {number && (
          <span className="text-xs font-bold tracking-[0.2em] text-cyan-300/70">
            {number}
          </span>
        )}
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

function ScienceBackground() {
  return (
    <div className="science-bg" aria-hidden="true">
      {/* Мягкие цветные пятна — «аврора» в цветах темы */}
      <div className="aurora aurora-one science-bg-anim" />
      <div className="aurora aurora-two science-bg-anim" />
      <div className="aurora aurora-three science-bg-anim" />

      {/* Молекулярная решётка: бензольные кольца и связи */}
      <MolecularLattice />

      {/* Пузырьки, медленно всплывающие как в растворе */}
      {backgroundBubbles.map((bubble, index) => (
        <span
          key={index}
          className="science-bubble"
          style={{
            left: bubble.left,
            width: bubble.size,
            height: bubble.size,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
            "--bubble-x": `${bubble.x}px`,
            "--bubble-opacity": bubble.opacity,
          }}
        />
      ))}

      {/* Парящие плитки-символы — перенесены из переднего плана в фон,
          чтобы никогда не перекрывать текст */}
      <div className="bg-ghost bg-ghost-atom science-bg-anim">
        <Atom className="h-10 w-10" strokeWidth={1.5} />
      </div>

      <div className="bg-ghost bg-ghost-dna science-bg-anim">
        <Dna className="h-9 w-9" strokeWidth={1.5} />
      </div>

      {/* Крупные водяные знаки — символы науки.
          На десктопе статичный атом заменяет живая орбита выше,
          на мобильных остаётся статичный атом */}
      <div className="bg-watermark bg-watermark-atom science-bg-anim md:hidden">
        <Atom className="h-full w-full" strokeWidth={1} />
      </div>

      {/* Анимированная орбита атома — живой водяной знак на заднем плане */}
      <div className="science-bg-ghost science-bg-anim">
        <ScienceOrbit className="absolute right-[6%] top-[12%] h-44 w-44 hidden md:block" />
      </div>

      <div className="bg-watermark bg-watermark-dna science-bg-anim">
        <Dna className="h-full w-full" strokeWidth={1} />
      </div>

      <div className="bg-watermark bg-watermark-flask science-bg-anim">
        <FlaskConical className="h-full w-full" strokeWidth={1} />
      </div>

      {/* Глобус — символ географии и экологии */}
      <div className="bg-watermark bg-watermark-globe science-bg-anim">
        <Globe2 className="h-full w-full" strokeWidth={1} />
      </div>
    </div>
  );
}

function MolecularLattice() {
  return (
    <svg
      className="bg-lattice science-bg-anim"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern
          id="mol-lattice"
          width="220"
          height="190"
          patternUnits="userSpaceOnUse"
        >
          <g
            stroke="var(--site-primary)"
            strokeOpacity="0.09"
            strokeWidth="1.1"
            fill="none"
          >
            <polygon points="110,37 162,67 162,127 110,157 58,127 58,67" />
          </g>

          <g
            stroke="var(--site-secondary)"
            strokeOpacity="0.06"
            strokeWidth="1"
            fill="none"
          >
            <polygon points="110,63 139.4,80 139.4,114 110,131 80.6,114 80.6,80" />
            <line x1="162" y1="67" x2="220" y2="67" strokeOpacity="0.05" />
            <line x1="162" y1="127" x2="220" y2="127" strokeOpacity="0.05" />
            <line x1="58" y1="67" x2="0" y2="67" strokeOpacity="0.05" />
            <line x1="58" y1="127" x2="0" y2="127" strokeOpacity="0.05" />
            <line x1="110" y1="157" x2="110" y2="190" strokeOpacity="0.05" />
          </g>

          <g fill="var(--site-primary)">
            <circle cx="110" cy="37" r="2.4" fillOpacity="0.16" />
            <circle cx="162" cy="67" r="2.4" fillOpacity="0.11" />
            <circle cx="162" cy="127" r="2.4" fillOpacity="0.11" />
            <circle cx="110" cy="157" r="2.4" fillOpacity="0.16" />
            <circle cx="58" cy="127" r="2.4" fillOpacity="0.11" />
            <circle cx="58" cy="67" r="2.4" fillOpacity="0.11" />
          </g>
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#mol-lattice)" />
    </svg>
  );
}

function ScienceOrbit({
  className = "absolute -right-8 top-8 hidden h-44 w-44 lg:block",
}) {
  return (
    <div className={`science-orbit pointer-events-none ${className}`}>
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

function DnaVisual() {
  const strandA =
    "M0,35 Q12.5,15 25,15 Q37.5,15 50,35 Q62.5,55 75,55 Q87.5,55 100,35 Q112.5,15 125,15 Q137.5,15 150,35 Q162.5,55 175,55 Q187.5,55 200,35 Q212.5,15 225,15 Q237.5,15 250,35 Q262.5,55 275,55 Q287.5,55 300,35";

  const strandB =
    "M0,35 Q12.5,55 25,55 Q37.5,55 50,35 Q62.5,15 75,15 Q87.5,15 100,35 Q112.5,55 125,55 Q137.5,55 150,35 Q162.5,15 175,15 Q187.5,15 200,35 Q212.5,55 225,55 Q237.5,55 250,35 Q262.5,15 275,15 Q287.5,15 300,35";

  const rungs = [25, 75, 125, 175, 225, 275];

  return (
    <svg
      viewBox="0 0 300 70"
      className="h-auto w-full"
      role="img"
      aria-label="Анимированная схема двойной спирали ДНК"
    >
      <defs>
        <linearGradient id="dnaGradientA" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#6ee7b7" />
        </linearGradient>

        <linearGradient id="dnaGradientB" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>

      {rungs.map((x) => (
        <line
          key={x}
          x1={x}
          y1={15}
          x2={x}
          y2={55}
          stroke="rgba(255,255,255,0.22)"
          strokeWidth={2}
          strokeLinecap="round"
          className="dna-rung"
          style={{ animationDelay: `${(x % 100) / 100}s` }}
        />
      ))}

      <path
        d={strandA}
        fill="none"
        stroke="url(#dnaGradientA)"
        strokeWidth={2.6}
        strokeLinecap="round"
        className="dna-strand dna-strand-a"
      />

      <path
        d={strandB}
        fill="none"
        stroke="url(#dnaGradientB)"
        strokeWidth={2.6}
        strokeLinecap="round"
        className="dna-strand dna-strand-b"
      />
    </svg>
  );
}

function FormulaTicker({ items }) {
  const values = items && items.length ? items : scienceFormulas;

  return (
    <div
      className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 py-3"
      aria-hidden="true"
    >
      <div className="formula-track flex w-max items-center whitespace-nowrap text-sm font-semibold tracking-wide text-slate-300">
        {[...values, ...values].map((formula, index) => (
          <span key={`${formula}-${index}`} className="flex items-center">
            <span>{formula}</span>
            <span className="mx-7 h-1 w-1 rounded-full bg-cyan-300/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

function SciencePanel({ profile }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Автопереключение вкладок предметов; клик по вкладке перезапускает таймер
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveIndex(
        (index) => (index + 1) % subjectShowcase.length
      );
    }, 6000);

    return () => window.clearTimeout(timer);
  }, [activeIndex]);

  const subject = subjectShowcase[activeIndex];

  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div className="absolute -inset-x-6 -inset-y-8 z-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(103,232,249,0.18),rgba(110,231,183,0.08),rgba(147,197,253,0.16))] blur-2xl" />

      <TiltContainer className="relative z-10">
        <div className="overflow-hidden rounded-[2rem] border border-white/12 bg-white/10 p-5 shadow-2xl backdrop-blur-2xl sm:p-7">
        <div className="data-stream absolute inset-x-0 top-0 z-10 h-20 opacity-60" />

        <div className="relative">
          {/* Вкладки предметов */}
          <div className="mb-5 grid grid-cols-4 gap-2">
            {subjectShowcase.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-pressed={isActive}
                  className={`relative flex flex-col items-center gap-1.5 overflow-hidden rounded-2xl border px-1 py-2.5 transition sm:px-2 ${
                    isActive
                      ? item.pill
                      : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  <item.tabIcon className="h-4 w-4 shrink-0" />
                  <span className="text-[11px] font-semibold leading-none">
                    {item.label}
                  </span>

                  {isActive && (
                    <motion.span
                      key={`progress-${activeIndex}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 6, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-[2px] rounded-full bg-current opacity-60"
                    />
                  )}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="mb-5 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                    {subject.header}
                  </p>
                  <p className="mt-1.5 truncate text-lg font-bold text-white sm:text-xl">
                    {subject.title}
                  </p>
                </div>

                <div
                  className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${subject.badge}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current shadow-[0_0_12px_rgba(255,255,255,0.45)]" />
                  {subject.label}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                {subject.tiles.map((tile, index) => (
                  <motion.div
                    key={`${subject.id}-${tile.bottom}`}
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 4 + index,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="rounded-2xl border border-white/10 bg-slate-950/60 p-2 text-center backdrop-blur transition hover:border-white/25 sm:p-3"
                  >
                    <p className="truncate text-[10px] font-semibold text-slate-500">
                      {tile.top}
                    </p>

                    {tile.bigIcon ? (
                      <tile.bigIcon
                        className={`mx-auto mt-1.5 h-6 w-6 sm:h-7 sm:w-7 ${subject.tileBig}`}
                      />
                    ) : (
                      <p
                        className={`text-xl font-black sm:text-2xl ${subject.tileBig}`}
                      >
                        {tile.big}
                      </p>
                    )}

                    <p className="mt-1 truncate text-[10px] text-slate-400">
                      {tile.bottom}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-5">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                  {subject.factVisual === "dna" ? (
                    <>
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Структура
                        </p>
                        <p className="text-sm font-semibold text-emerald-200">
                          ДНК
                        </p>
                      </div>

                      <DnaVisual />
                    </>
                  ) : (
                    <div className="flex min-h-[76px] items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${subject.badge}`}
                      >
                        <subject.factIcon className="h-4 w-4" />
                      </div>

                      <p className="text-sm leading-6 text-slate-300">
                        {subject.factText}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <FormulaTicker items={subject.ticker} />
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/72 p-5 backdrop-blur-xl">
            <p className="text-sm text-cyan-200">{profile.profession}</p>
            <p className="mt-1 break-words text-2xl font-black text-white">
              {profile.full_name}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              {profile.science_card_title}
            </p>
          </div>
        </div>
        </div>
      </TiltContainer>
    </div>
  );
}

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    contact: "",
    message: "",
    company: "",
  });

  const [status, setStatus] = useState("idle");
  const [errorText, setErrorText] = useState("");
  // Куда реально доставлено сообщение: { email: boolean, db: boolean }
  const [delivery, setDelivery] = useState(null);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm({ name: "", contact: "", message: "", company: "" });
    setErrorText("");
    setStatus("idle");
    setDelivery(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (status === "sending") return;

    const name = form.name.trim();
    const contact = form.contact.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      setErrorText("Пожалуйста, укажите ваше имя.");
      return;
    }

    if (contact.length < 3) {
      setErrorText(
        "Укажите телефон, email или ник в Telegram — чтобы я могла ответить."
      );
      return;
    }

    if (message.length < 10) {
      setErrorText(
        "Сообщение слишком короткое — напишите чуть подробнее (от 10 символов)."
      );
      return;
    }

    setErrorText("");
    setStatus("sending");

    // Скрытое поле-приманка для спам-ботов: люди его не видят и не заполняют.
    if (form.company.trim()) {
      resetForm();
      setStatus("success");
      return;
    }

    // Сообщение уходит двумя путями:
    //   1) письмом на почту учителя через серверную функцию (если настроена);
    //   2) в базу Supabase — это раздел «Сообщения» в админ-панели.
    // Успех = сработал хотя бы один путь.
    let emailSent = false;
    let dbSaved = false;
    let dbErrorText = "";

    try {
      const emailResponse = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, contact, message }),
      });

      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        emailSent = Boolean(emailData.ok);
      }
    } catch {
      // Письмо не отправилось (например, локальный запуск без Vercel) —
      // не страшно: сообщение всё равно сохранится в админ-панели.
    }

    const { error } = await supabase
      .from("contact_messages")
      .insert({ name, contact, message });

    if (!error) {
      dbSaved = true;
    } else {
      dbErrorText = `${error.message || ""} ${error.code || ""}`;
    }

    if (emailSent || dbSaved) {
      setDelivery({ email: emailSent, db: dbSaved });
      setForm({ name: "", contact: "", message: "", company: "" });
      setStatus("success");
      return;
    }

    const missingTable =
      /contact_messages|PGRST205|does not exist|not found|404/i.test(
        dbErrorText
      );

    setErrorText(
      missingTable
        ? "Форма ещё не подключена к базе: один раз выполните скрипт supabase-setup.sql в Supabase (SQL Editor) — после этого сообщения начнут сохраняться."
        : "Не удалось отправить сообщение. Попробуйте позже или напишите напрямую через мессенджеры и телефон."
    );

    setStatus("error");
  }

  const inputClassName =
    "w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/20";

  if (status === "success") {
    return (
      <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-950/50 p-6 sm:p-7">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex flex-1 flex-col items-center justify-center py-8 text-center"
        >
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-300/10 text-emerald-200 ring-1 ring-emerald-300/30">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h3 className="text-xl font-bold text-white">
            Сообщение отправлено!
          </h3>

          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
            {delivery?.email && delivery?.db
              ? "Спасибо! Ваше сообщение доставлено на почту и в панель администратора — отвечу в ближайшее время."
              : delivery?.email
                ? "Спасибо! Ваше письмо доставлено на почту — отвечу в ближайшее время."
                : "Спасибо! Ваше сообщение сохранено в панели администратора — отвечу в ближайшее время."}
          </p>

          <button
            type="button"
            onClick={resetForm}
            className="mt-7 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Отправить ещё одно
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/50 p-6 sm:p-7">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
          <Send className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-white sm:text-xl">
            Написать сообщение
          </h3>
          <p className="text-sm text-slate-400">
            Обычно отвечаю в течение дня
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Ваше имя</span>

          <input
            type="text"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Например: Мария"
            maxLength={80}
            className={inputClassName}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">
            Телефон, email или Telegram
          </span>

          <input
            type="text"
            value={form.contact}
            onChange={(event) => updateField("contact", event.target.value)}
            placeholder="+7 999 123-45-67 / @username / mail@example.com"
            maxLength={120}
            className={inputClassName}
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Сообщение</span>

          <textarea
            value={form.message}
            onChange={(event) => updateField("message", event.target.value)}
            placeholder="Здравствуйте! Хочу уточнить про занятия по химии для 9 класса..."
            rows={4}
            maxLength={2000}
            className={`${inputClassName} resize-none`}
            required
          />
        </label>

        {/* Скрытое поле-приманка для спам-ботов */}
        <input
          type="text"
          value={form.company}
          onChange={(event) => updateField("company", event.target.value)}
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="pointer-events-none absolute -left-[9999px] h-0 w-0 opacity-0"
        />

        {errorText && (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm leading-6 text-red-200">
            {errorText}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="btn-shine inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-300 px-7 py-4 text-center font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-950/30 border-t-slate-950" />
              Отправляем...
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              Отправить сообщение
            </>
          )}
        </button>

        <p className="text-center text-xs leading-5 text-slate-500">
          Нажимая «Отправить сообщение», вы соглашаетесь на обработку
          указанных данных только для обратной связи и принимаете{" "}
          <a
            href="/privacy"
            className="font-semibold text-cyan-200 transition hover:text-cyan-100"
          >
            политику конфиденциальности
          </a>
          .
        </p>
      </form>
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

  // Фильтр и пагинация материалов по предмету в разделе «Полезные учебные материалы»
  const MATERIALS_PER_PAGE = 6;
  const [subjectFilter, setSubjectFilter] = useState("Все");
  const [materialPage, setMaterialPage] = useState(1);

  // Порядок табов: сперва основные предметы, затем любые другие из базы
  const preferredSubjects = ["Химия", "Биология", "География", "Экология"];
  const uniqueSubjects = [
    ...new Set(materials.map((item) => item.subject).filter(Boolean)),
  ];
  const filterTabs = [
    "Все",
    ...preferredSubjects.filter((subject) => uniqueSubjects.includes(subject)),
    ...uniqueSubjects.filter(
      (subject) => !preferredSubjects.includes(subject)
    ),
  ];
  // Каждый материал относится ровно к одному предмету:
  // совпадение строгое, без частичного поиска
  const matchesSubject = (material, filter) =>
    filter === "Все" || material.subject === filter;
  const visibleMaterials = materials.filter((material) =>
    matchesSubject(material, subjectFilter)
  );
  const totalPages = Math.max(1, Math.ceil(visibleMaterials.length / MATERIALS_PER_PAGE));
  const currentPage = Math.min(materialPage, totalPages);
  const pageMaterials = visibleMaterials.slice(
    (currentPage - 1) * MATERIALS_PER_PAGE,
    currentPage * MATERIALS_PER_PAGE
  );
  const countBySubject = (filter) =>
    filter === "Все"
      ? materials.length
      : materials.filter((material) => matchesSubject(material, filter))
          .length;

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
      console.error("Ошибка загрузки данных сайта:", error);
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
    setMaterialPage(1);
  }, [subjectFilter]);

  useEffect(() => {
    setMaterialPage((current) =>
      Math.min(Math.max(current, 1), totalPages)
    );
  }, [totalPages]);

  useEffect(() => {
    function handleScroll() {
      setShowBackTop(window.scrollY > 700);

      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

      setScrollProgress(Math.min(Math.max(nextProgress, 0), 1));
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
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
  const currentYear = new Date().getFullYear();

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
              <CardBg />
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
      {/* Зернистая плёнка — премиальная текстура поверх всего сайта */}
      <div className="grain-overlay" aria-hidden="true" />

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

      {/* Научный фон: аврора, молекулярная решётка, пузырьки, водяные знаки.
          Слой с z-index: -1 — весь контент разделов (z-10) поверх него. */}
      <ScienceBackground />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(14,165,233,0.10),transparent_28%,rgba(16,185,129,0.08)_52%,transparent_78%),linear-gradient(to_bottom,rgba(15,23,42,0.24),rgba(2,6,23,0.94))]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/78 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5">
          <a href="#" className="flex items-center gap-3" onClick={closeMenu}>
            <motion.div
              whileHover={{ rotate: 12, scale: 1.05 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15 ring-1 ring-cyan-300/30 sm:h-11 sm:w-11"
            >
              <Atom className="h-5 w-5 text-cyan-200 sm:h-6 sm:w-6" />
            </motion.div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-xs">
                Учитель
              </p>
              <p className="truncate text-sm font-semibold text-white sm:text-base">
                Естественные науки
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm text-slate-300 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 transition hover:bg-white/8 hover:text-cyan-200 xl:px-4"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white sm:h-11 sm:w-11 lg:hidden"
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
            className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-xl lg:hidden"
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
                    <p className="font-semibold text-white">Естественные науки</p>
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

              <div className="mt-auto space-y-3 pt-8">
                {telegramHref && (
                  <a
                    href={telegramHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-6 py-3.5 text-sm font-semibold text-cyan-100"
                  >
                    <Send className="h-4 w-4" />
                    Написать в Telegram
                  </a>
                )}

                {contacts.phone && (
                  <a
                    href={phoneHref}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3.5 text-sm font-semibold text-slate-200"
                  >
                    <Phone className="h-4 w-4" />
                    {contacts.phone}
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative z-10 px-4 py-14 sm:px-6 md:py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:min-h-[calc(100vh-84px)] lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="min-w-0 max-w-3xl"
          >
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
                Индивидуальный подход
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                <Atom className="h-3.5 w-3.5 text-cyan-200" />
                Химия
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                <Dna className="h-3.5 w-3.5 text-emerald-200" />
                Биология
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                <Globe2 className="h-3.5 w-3.5 text-amber-200" />
                География
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                <Leaf className="h-3.5 w-3.5 text-lime-200" />
                Экология
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

            <h1 className="max-w-4xl break-words text-4xl font-black leading-[1.06] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-7xl">
              <RevealWords text={profile.full_name} delay={0.1} />

              <span className="mt-3 block text-3xl leading-tight text-slate-100 md:text-5xl">
                <RevealWords text={profile.hero_title} delay={0.3} />{" "}

                <span className="inline-block overflow-hidden align-bottom pb-[0.14em] -mb-[0.14em]">
                  <motion.span
                    className="hero-gradient-text inline-block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      delay: 0.5,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {profile.hero_highlight}
                  </motion.span>
                </span>
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl md:leading-9">
              {profile.hero_description}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <MagneticButton
                href="#contacts"
                className="btn-shine inline-block rounded-full bg-cyan-300 px-6 py-3.5 text-center text-sm font-bold text-slate-950 shadow-xl shadow-cyan-950/30 transition hover:bg-cyan-200 sm:px-7 sm:py-4 sm:text-base"
              >
                Записаться на занятие
              </MagneticButton>

              <MagneticButton
                href="#materials"
                className="inline-block rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-center text-sm font-bold text-white backdrop-blur transition hover:bg-white/10 sm:px-7 sm:py-4 sm:text-base"
              >
                Посмотреть материалы
              </MagneticButton>
            </div>

            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-2.5 sm:gap-3">
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
                  className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur sm:p-4"
                >
                  <p
                    className={
                      index === 0
                        ? "text-2xl font-black text-cyan-200 sm:text-3xl"
                        : index === 1
                          ? "text-2xl font-black text-emerald-200 sm:text-3xl"
                          : "text-2xl font-black text-blue-200 sm:text-3xl"
                    }
                  >
                    <AnimatedCounter value={value} />
                  </p>
                  <p className="mt-1 break-words text-xs leading-4 text-slate-400 sm:text-sm sm:leading-5">
                    {label}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 grid max-w-2xl grid-cols-3 gap-2.5 sm:gap-3">
              {[
                ["01", "Разбор темы простым языком"],
                ["02", "Схемы, задания и практика"],
                ["03", "Подготовка к проверочным"],
              ].map(([number, text]) => (
                <div
                  key={number}
                  className="rounded-2xl border border-white/10 bg-slate-950/35 p-3 backdrop-blur sm:p-4"
                >
                  <p className="text-xs font-bold text-cyan-200">{number}</p>
                  <p className="mt-1.5 text-xs leading-4 text-slate-300 sm:mt-2 sm:text-sm sm:leading-5">
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
            className="relative min-w-0 w-full lg:justify-self-end"
          >
            <SciencePanel profile={profile} />
          </motion.div>
        </div>
      </section>

      <KnowledgeMarquee />

      <motion.section
        id="about"
        {...sectionMotion}
        className="relative z-10 px-4 py-14 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Обо мне"
            number="01"
            title={profile.about_title}
            text={profile.about_text}
          />

          <div className="grid gap-5 md:grid-cols-6">
            {/* Мой подход — большая карточка с анимированной колбой */}
            <SpotlightCard
              whileHover={{ y: -6 }}
              className="premium-panel p-6 sm:p-7 md:col-span-4 md:p-8"
            >
              <CardBg />
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                    <FlaskConical className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold sm:text-2xl">
                    {profile.approach_title}
                  </h3>

                  <p className="mt-4 leading-8 text-slate-300">
                    {profile.approach_text}
                  </p>
                </div>

                <div className="mx-auto shrink-0 sm:mx-0">
                  <AnimatedFlask />
                </div>
              </div>
            </SpotlightCard>

            {/* Химия внутри нас — мини-плитки элементов */}
            <SpotlightCard
              whileHover={{ y: -6 }}
              className="premium-panel p-6 md:col-span-2"
            >
              <CardBg />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Микроэлементы
              </p>

              <p className="mt-1.5 text-lg font-bold text-white">
                Химия внутри нас
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {aboutElements.map((element, index) => (
                  <motion.div
                    key={element.symbol}
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 3.6 + index * 0.7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="rounded-xl border border-white/10 bg-slate-950/50 p-2.5 text-center"
                  >
                    <p className="text-[9px] font-semibold text-slate-500">
                      {element.number}
                    </p>
                    <p className="text-lg font-black text-emerald-200">
                      {element.symbol}
                    </p>
                    <p className="mt-0.5 truncate text-[9px] text-slate-400">
                      {element.name}
                    </p>
                  </motion.div>
                ))}
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-500">
                Кальций, фосфор, железо и магний — элементы, без которых не
                работает ни один организм.
              </p>
            </SpotlightCard>

            {/* Что получает ученик */}
            <SpotlightCard
              whileHover={{ y: -6 }}
              className="premium-panel p-6 sm:p-7 md:col-span-3"
            >
              <CardBg />
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <h3 className="text-xl font-bold sm:text-2xl">
                Что получает ученик
              </h3>

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
            </SpotlightCard>

            {/* Цитата */}
            <SpotlightCard
              whileHover={{ y: -6 }}
              className="premium-panel overflow-hidden p-6 sm:p-7 md:col-span-3"
            >
              <CardBg />
              <div className="relative flex h-full flex-col">
                <span className="pointer-events-none absolute -top-4 left-0 select-none text-8xl font-black leading-none text-cyan-300/10">
                  “
                </span>

                <p className="relative pt-8 text-lg font-medium leading-8 text-slate-200">
                  {profile.science_card_text}
                </p>

                <p className="mt-auto pt-6 text-sm text-slate-500">
                  — {profile.full_name}, {profile.profession}
                </p>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </motion.section>

      <SectionDivider />

      <motion.section
        id="services"
        {...sectionMotion}
        className="relative z-10 px-4 py-14 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Направления"
            number="02"
            title="Чем я могу помочь"
            text="Химия, биология, география и экология: занятия по школьной программе, разбор сложных тем, подготовка к контрольным, олимпиадам и экзаменам — в Каспийске и онлайн."
          />

          {services.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="Направления пока не добавлены"
              text="Добавьте услуги в админ-панели, и блок сразу станет готовой витриной занятий."
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {services.map((service, index) => {
                const theme = getServiceTheme(service.icon);

                return (
                  <SpotlightCard
                    key={service.id || service.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.55 }}
                    whileHover={{ y: -8 }}
                    className={`premium-card group isolate relative overflow-hidden p-5 transition ${theme.hover}`}
                  >
              <CardBg />

                    {getServiceVisual(service.icon)}

                    <div className="mt-5 flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${theme.iconBox}`}
                      >
                        {getServiceIcon(service.icon)}
                      </div>

                      <h3 className="text-lg font-bold sm:text-xl">
                        {service.title}
                      </h3>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {service.text}
                    </p>
                  </SpotlightCard>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      <SectionDivider />

      <motion.section
        id="materials"
        {...sectionMotion}
        className="relative z-10 px-4 py-14 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Материалы"
            number="03"
            title="Полезные учебные материалы"
            text="Конспекты, таблицы и схемы — добавляются через админ-панель и сразу появляются на сайте."
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
            <>
              {/* Фильтр по предмету */}
              {materials.length > 0 && (
                <div className="mb-9 flex flex-wrap items-center justify-center gap-2">
                  {filterTabs.map((tab) => {
                    const isActive = subjectFilter === tab;

                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setSubjectFilter(tab)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        }`}
                      >
                        {tab}
                        <span
                          className={`text-xs tabular-nums ${
                            isActive ? "text-cyan-200/80" : "text-slate-500"
                          }`}
                        >
                          {countBySubject(tab)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pageMaterials.map((item, index) => {
                const materialUrl = safeExternalUrl(item.link_url);

                return (
                  <SpotlightCard
                    key={item.id || item.title}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.55 }}
                    whileHover={{ y: -8 }}
                    className="premium-card isolate relative flex flex-col overflow-hidden p-6"
                  >
              <CardBg />
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-4 py-2 text-sm ${getSubjectBadgeClass(
                          item.subject
                        )}`}
                      >
                        {item.subject}
                      </span>

                      {item.grade && (
                        <span className="text-sm text-slate-400">
                          {item.grade}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold sm:text-2xl">
                      {item.title}
                    </h3>

                    {item.description && (
                      <p className="mt-4 leading-7 text-slate-300">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-auto pt-6">
                      {materialUrl ? (
                        <a
                          href={materialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                        >
                          Открыть материал
                          <ChevronRight className="h-4 w-4" />
                        </a>
                      ) : (
                        <span className="inline-block rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400">
                          Материал без ссылки
                        </span>
                      )}
                    </div>
                  </SpotlightCard>
                );
              })}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
                  <p className="text-sm text-slate-400 tabular-nums">
                    {(currentPage - 1) * MATERIALS_PER_PAGE + 1}
                    –
                    {Math.min(
                      currentPage * MATERIALS_PER_PAGE,
                      visibleMaterials.length
                    )}{" "}
                    из {visibleMaterials.length}
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setMaterialPage((current) => Math.max(1, current - 1))
                      }
                      disabled={currentPage === 1}
                      aria-label="Предыдущая страница"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                      (page) => {
                        const isActive = page === currentPage;
                        return (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setMaterialPage(page)}
                            aria-label={`Страница ${page}`}
                            aria-current={isActive ? "page" : undefined}
                            className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full border px-3 text-sm font-semibold tabular-nums transition ${
                              isActive
                                ? "border-cyan-300/45 bg-cyan-300/15 text-cyan-100"
                                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setMaterialPage((current) =>
                          Math.min(totalPages, current + 1)
                        )
                      }
                      disabled={currentPage === totalPages}
                      aria-label="Следующая страница"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.section>

      <SectionDivider />

      <motion.section
        id="achievements"
        {...sectionMotion}
        className="relative z-10 px-4 py-14 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Достижения"
            number="04"
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement, index) => (
                <SpotlightCard
                  key={achievement.id || achievement.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="premium-card p-6"
                >
              <CardBg />
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
                </SpotlightCard>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <SectionDivider />

      <motion.section
        id="gallery"
        {...sectionMotion}
        className="relative z-10 px-4 py-14 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Галерея"
            number="05"
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item, index) => (
                <SpotlightCard
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.55 }}
                  whileHover={{ y: -8 }}
                  className="premium-card group overflow-hidden"
                >
              <CardBg />
                  <div className="relative overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.title || "Фото галереи"}
                      loading="lazy"
                      className="h-64 w-full object-cover transition duration-700 group-hover:scale-110 sm:h-72"
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
                </SpotlightCard>
              ))}
            </div>
          )}
        </div>
      </motion.section>

      <SectionDivider />

      <motion.section
        id="reviews"
        {...sectionMotion}
        className="relative z-10 px-4 py-14 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <SectionTitle
            badge="Отзывы"
            number="06"
            title="Что говорят ученики и родители"
            text="Отзывы помогают показать подход к обучению и реальные результаты."
          />

          {reviews.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="Отзывов пока нет"
              text="Добавьте отзывы в админ-панели — они укрепляют доверие и показывают результаты."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {reviews.map((review, index) => {
                const rating = Math.min(
                  Math.max(Number(review.rating || 5), 1),
                  5
                );

                const initials = review.name
                  .trim()
                  .split(/\s+/)
                  .map((word) => word[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                return (
                  <SpotlightCard
                    key={review.id || review.name}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.55 }}
                    whileHover={{ y: -8 }}
                    className="premium-card p-6 sm:p-7 md:p-8"
                  >
              <CardBg />
                    <div className="mb-4 flex gap-1 text-yellow-200">
                      {Array.from({ length: rating }).map((_, starIndex) => (
                        <Star
                          key={starIndex}
                          className="h-5 w-5 fill-current"
                        />
                      ))}
                    </div>

                    <p className="leading-8 text-slate-300">“{review.text}”</p>

                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300/20 to-emerald-300/20 text-sm font-bold text-cyan-200 ring-1 ring-white/10">
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <p className="font-bold text-white">{review.name}</p>

                        {review.role && (
                          <p className="mt-0.5 text-sm text-slate-400">
                            {review.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>
          )}
        </div>
      </motion.section>

      <SectionDivider />

      <motion.section
        id="contacts"
        {...sectionMotion}
        className="relative z-10 px-4 py-14 sm:px-6 md:py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="premium-panel overflow-hidden p-6 sm:p-7 md:p-12">
              <CardBg />
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-200">
                  <MessageCircle className="h-4 w-4" />
                  Контакты
                </div>

                <h2 className="text-3xl font-black leading-tight md:text-4xl">
                  Запишитесь на занятие или задайте вопрос
                </h2>

                <p className="mt-5 leading-8 text-slate-300">
                  Напишите удобным способом, и мы обсудим цель занятий, уровень
                  подготовки и подходящий формат обучения.
                </p>

                <div className="mt-8 space-y-3">
                  {contacts.phone && (
                    <a
                      href={phoneHref}
                      className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 sm:p-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                        <Phone className="h-5 w-5" />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-xs text-slate-500">
                          Телефон
                        </span>
                        <span className="block truncate font-semibold text-white">
                          {contacts.phone}
                        </span>
                      </span>
                    </a>
                  )}

                  {contacts.email && (
                    <a
                      href={emailHref}
                      className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 sm:p-5"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                        <Mail className="h-5 w-5" />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-xs text-slate-500">
                          Email
                        </span>
                        <span className="block truncate font-semibold text-white">
                          {contacts.email}
                        </span>
                      </span>
                    </a>
                  )}

                  {(contacts.city || contacts.address) && (
                    <div className="flex items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-5">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                        <MapPin className="h-5 w-5" />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-xs text-slate-500">
                          Город / формат
                        </span>
                        <span className="block break-words font-semibold text-white">
                          {contacts.address || contacts.city}
                        </span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {telegramHref && (
                    <a
                      href={telegramHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-3.5 text-center font-bold text-slate-950 transition hover:bg-cyan-200"
                    >
                      <Send className="h-5 w-5" />
                      Telegram
                    </a>
                  )}

                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-6 py-3.5 text-center font-bold text-emerald-100 transition hover:bg-emerald-300/20"
                    >
                      WhatsApp
                    </a>
                  )}

                  {mapHref && (
                    <a
                      href={mapHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-6 py-3.5 text-center font-bold text-white transition hover:bg-white/10"
                    >
                      <MapPin className="h-5 w-5" />
                      Открыть карту
                    </a>
                  )}
                </div>
              </div>

              <ContactForm />
            </div>
          </div>
        </div>
      </motion.section>

      <footer className="relative z-10 border-t border-white/10 px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
          <div className="min-w-0">
            <p className="break-words font-semibold text-white">
              © {currentYear} {profile.full_name}
            </p>
            <p className="mt-1 text-sm text-slate-500">{profile.profession}</p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-400">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="transition hover:text-cyan-200"
              >
                {link.label}
              </a>
            ))}
            <a href="/privacy" className="transition hover:text-cyan-200">
              Политика конфиденциальности
            </a>
          </nav>
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
            className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-cyan-300 text-slate-950 shadow-2xl transition hover:bg-cyan-200 sm:bottom-6 sm:right-6"
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
