import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Phone,
  Settings,
  Trophy,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import ProfileManager from "../components/ProfileManager";
import MaterialsManager from "../components/MaterialsManager";
import ContactsManager from "../components/ContactsManager";
import CollectionManager from "../components/CollectionManager";

const adminSections = [
  {
    key: "profile",
    icon: <Settings />,
    title: "Основная информация",
    text: "ФИО, первый экран, описание, стаж, блок “Обо мне” и научная карточка.",
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
    text: "Фото кабинета, уроков, мероприятий и материалов.",
  },
  {
    key: "contacts",
    icon: <Phone />,
    title: "Контакты",
    text: "Телефон, email, Telegram, WhatsApp, город и адрес.",
  },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("profile");

  const selectedSection = adminSections.find(
    (section) => section.key === activeSection
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  function renderActiveSection() {
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

    if (activeSection === "contacts") {
      return <ContactsManager />;
    }

    if (activeSection === "gallery") {
      return (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
            <Award className="h-7 w-7" />
          </div>

          <h3 className="text-2xl font-bold">Галерея будет позже</h3>

          <p className="mt-3 text-slate-300">
            Раздел с загрузкой фотографий добавим отдельным этапом через
            Supabase Storage.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h3 className="text-2xl font-bold">Раздел не найден</h3>
        <p className="mt-3 text-slate-300">
          Выбери другой раздел в меню слева.
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 px-6 py-5 backdrop-blur-xl">
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

      <section className="px-6 py-10">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
            <div className="mb-4 px-3">
              <h2 className="text-lg font-bold">Разделы</h2>

              <p className="mt-1 text-sm text-slate-400">
                Выбери, что нужно редактировать.
              </p>
            </div>

            <div className="space-y-2">
              {adminSections.map((section) => (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => setActiveSection(section.key)}
                  className={
                    activeSection === section.key
                      ? "flex w-full items-center gap-3 rounded-2xl bg-cyan-300 px-4 py-3 text-left font-semibold text-slate-950"
                      : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-300 transition hover:bg-white/10 hover:text-white"
                  }
                >
                  <span
                    className={
                      activeSection === section.key
                        ? "flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/10"
                        : "flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"
                    }
                  >
                    {section.icon}
                  </span>

                  <span>{section.title}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-300/10 to-emerald-300/10 p-8 backdrop-blur-xl">
              <h2 className="text-3xl font-black">
                {selectedSection?.title}
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