import { useCallback, useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Image,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Palette,
  Phone,
  Settings,
  Trophy,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import ProfileManager from "../components/ProfileManager";
import MaterialsManager from "../components/MaterialsManager";
import ContactsManager from "../components/ContactsManager";
import CollectionManager from "../components/CollectionManager";
import GalleryManager from "../components/GalleryManager";
import DesignManager from "../components/DesignManager";
import MessagesManager from "../components/MessagesManager";

const adminSections = [
  {
    key: "messages",
    icon: <Inbox />,
    title: "Сообщения",
    text: "Сообщения из формы обратной связи на сайте: вопросы, заявки на занятия и обратная связь.",
  },
  {
    key: "design",
    icon: <Palette />,
    title: "Дизайн сайта",
    text: "Цветовая тема, фон, карточки, анимации, свечение и визуальные эффекты.",
  },
  {
    key: "profile",
    icon: <Settings />,
    title: "Основная информация",
    text: "ФИО, первый экран, описание, стаж и блок “Обо мне”.",
  },
  {
    key: "advantages",
    icon: <CheckCircle2 />,
    title: "Преимущества",
    text: "Список преимуществ: индивидуальный подход, понятное объяснение, материалы и подготовка.",
  },
  {
    key: "services",
    icon: <BriefcaseBusiness />,
    title: "Направления работы",
    text: "Химия, биология, подготовка к экзаменам и другие услуги.",
  },
  {
    key: "materials",
    icon: <BookOpen />,
    title: "Учебные материалы",
    text: "Конспекты, таблицы, схемы, ссылки и PDF-файлы.",
  },
  {
    key: "achievements",
    icon: <Trophy />,
    title: "Достижения",
    text: "Сертификаты, курсы, конкурсы, результаты учеников.",
  },
  {
    key: "reviews",
    icon: <MessageSquare />,
    title: "Отзывы",
    text: "Отзывы учеников и родителей.",
  },
  {
    key: "gallery",
    icon: <Image />,
    title: "Галерея",
    text: "Фото кабинета, уроков, мероприятий, лабораторных работ и учебных материалов.",
  },
  {
    key: "contacts",
    icon: <Phone />,
    title: "Контакты",
    text: "Телефон, email, Telegram, WhatsApp, город и адрес.",
  },
];

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("messages");
  const [unreadCount, setUnreadCount] = useState(0);

  const selectedSection = adminSections.find(
    (section) => section.key === activeSection
  );

  const refreshUnreadCount = useCallback(async () => {
    const { count, error } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);

    if (!error && typeof count === "number") {
      setUnreadCount(count);
    }
  }, []);

  useEffect(() => {
    refreshUnreadCount();

    const interval = setInterval(refreshUnreadCount, 20000);

    return () => {
      clearInterval(interval);
    };
  }, [refreshUnreadCount, activeSection]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function renderActiveSection() {
    if (activeSection === "messages") {
      return <MessagesManager onUnreadCountChange={setUnreadCount} />;
    }

    if (activeSection === "design") {
      return <DesignManager />;
    }

    if (activeSection === "profile") {
      return <ProfileManager />;
    }

    if (activeSection === "advantages") {
      return <CollectionManager type="advantages" />;
    }

    if (activeSection === "services") {
      return <CollectionManager type="services" />;
    }

    if (activeSection === "materials") {
      return <MaterialsManager />;
    }

    if (activeSection === "achievements") {
      return <CollectionManager type="achievements" />;
    }

    if (activeSection === "reviews") {
      return <CollectionManager type="reviews" />;
    }

    if (activeSection === "gallery") {
      return <GalleryManager />;
    }

    if (activeSection === "contacts") {
      return <ContactsManager />;
    }

    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
          <Award className="h-7 w-7" />
        </div>

        <h3 className="text-2xl font-bold">Раздел не найден</h3>

        <p className="mt-3 text-slate-300">
          Выбери другой раздел в меню слева.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/85 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/15 text-cyan-200">
              <LayoutDashboard className="h-6 w-6" />
            </div>

            <div>
              <p className="text-sm text-slate-400">Админ-панель</p>
              <h1 className="font-bold">Управление сайтом</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              className="rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              На сайт
            </a>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full bg-red-400/10 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
            >
              <LogOut className="h-4 w-4" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      <section className="px-4 py-8 sm:px-6 sm:py-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_1fr] lg:gap-8">
          <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/5 p-3 backdrop-blur-xl sm:p-4 lg:sticky lg:top-28">
            <div className="mb-4 hidden px-3 lg:block">
              <h2 className="text-lg font-bold">Разделы</h2>

              <p className="mt-1 text-sm text-slate-400">
                Выбери, что нужно редактировать.
              </p>
            </div>

            {/* На мобильных — горизонтальная лента разделов, на десктопе — вертикальный список */}
            <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-2 lg:overflow-visible lg:px-0 lg:pb-0">
              {adminSections.map((section) => {
                const isActive = activeSection === section.key;
                const showBadge = section.key === "messages" && unreadCount > 0;

                return (
                  <button
                    key={section.key}
                    type="button"
                    onClick={() => setActiveSection(section.key)}
                    className={
                      isActive
                        ? "flex shrink-0 items-center gap-3 rounded-2xl bg-cyan-300 px-4 py-3 text-left font-semibold text-slate-950 lg:w-full lg:shrink"
                        : "flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-300 transition hover:bg-white/10 hover:text-white lg:w-full lg:shrink"
                    }
                  >
                    <span
                      className={
                        isActive
                          ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950/10"
                          : "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10"
                      }
                    >
                      {section.icon}
                    </span>

                    <span className="whitespace-nowrap">{section.title}</span>

                    {showBadge && (
                      <span
                        className={
                          isActive
                            ? "ml-auto hidden min-w-6 rounded-full bg-slate-950 px-2 py-0.5 text-center text-xs font-bold text-cyan-200 lg:block"
                            : "ml-auto hidden min-w-6 rounded-full bg-cyan-300 px-2 py-0.5 text-center text-xs font-bold text-slate-950 lg:block"
                        }
                      >
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-6 lg:space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-300/10 to-emerald-300/10 p-6 backdrop-blur-xl sm:p-8">
              <h2 className="text-2xl font-black sm:text-3xl">
                {selectedSection?.title}

                {selectedSection?.key === "messages" && unreadCount > 0 && (
                  <span className="ml-3 inline-flex min-w-8 items-center justify-center rounded-full bg-cyan-300 px-2.5 py-1 align-middle text-sm font-bold text-slate-950">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </h2>

              <p className="mt-3 max-w-2xl text-slate-300">
                {selectedSection?.text}
              </p>
            </div>

            {renderActiveSection()}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;
