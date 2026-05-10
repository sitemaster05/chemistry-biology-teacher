import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  BriefcaseBusiness,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Phone,
  Settings,
  Trophy,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const adminSections = [
  {
    icon: <Settings />,
    title: "Основная информация",
    text: "ФИО, описание, стаж, главный текст на сайте.",
  },
  {
    icon: <BriefcaseBusiness />,
    title: "Направления работы",
    text: "Химия, биология, подготовка к экзаменам и другие услуги.",
  },
  {
    icon: <BookOpen />,
    title: "Учебные материалы",
    text: "Конспекты, таблицы, схемы, ссылки и PDF-файлы.",
  },
  {
    icon: <Trophy />,
    title: "Достижения",
    text: "Сертификаты, курсы, конкурсы, результаты учеников.",
  },
  {
    icon: <MessageSquare />,
    title: "Отзывы",
    text: "Отзывы учеников и родителей.",
  },
  {
    icon: <Image />,
    title: "Галерея",
    text: "Фото кабинета, уроков, мероприятий и материалов.",
  },
  {
    icon: <Phone />,
    title: "Контакты",
    text: "Телефон, email, Telegram, WhatsApp и город.",
  },
];

function AdminDashboard() {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/80 px-6 py-5 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
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
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-300/10 to-emerald-300/10 p-8 backdrop-blur-xl">
            <h2 className="text-3xl font-black">Панель управления</h2>

            <p className="mt-3 max-w-2xl text-slate-300">
              Здесь будет возможность редактировать сайт без кода: добавлять
              материалы, менять контакты, отзывы, услуги и фотографии.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {adminSections.map((section) => (
              <div
                key={section.title}
                className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition hover:border-cyan-300/30 hover:bg-white/10"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                  {section.icon}
                </div>

                <h3 className="text-xl font-bold">{section.title}</h3>

                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {section.text}
                </p>

                <button className="mt-6 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                  Открыть раздел
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;