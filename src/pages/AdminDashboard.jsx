import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
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
import ProfileManager from "../components/ProfileManager";
import MaterialsManager from "../components/MaterialsManager";
import ContactsManager from "../components/ContactsManager";
import SimpleCollectionManager from "../components/SimpleCollectionManager";

const iconOptions = [
  { value: "flask", label: "Колба" },
  { value: "dna", label: "ДНК" },
  { value: "graduation", label: "Обучение" },
  { value: "book", label: "Книга" },
  { value: "microscope", label: "Микроскоп" },
  { value: "atom", label: "Атом" },
];

const adminSections = [
  {
    key: "profile",
    icon: <Settings />,
    title: "Основная информация",
    text: "ФИО, описание, стаж, главный текст на сайте.",
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

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  const selectedSection = adminSections.find(
    (section) => section.key === activeSection
  );

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
                  onClick={() => setActiveSection(section.key)}
                  className={
                    activeSection === section.key
                      ? "flex w-full items-center gap-3 rounded-2xl bg-cyan-300 px-4 py-3 text-left font-semibold text-slate-950"
                      : "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-300 transition hover:bg-white/10 hover:text-white"
                  }
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
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

            {activeSection === "profile" && <ProfileManager />}

            {activeSection === "materials" && <MaterialsManager />}

            {activeSection === "contacts" && <ContactsManager />}

            {activeSection === "services" && (
              <SimpleCollectionManager
                tableName="services"
                title="направление работы"
                description="Добавляй и редактируй направления, которые отображаются на главной странице."
                emptyItem={{
                  title: "",
                  description: "",
                  icon_name: "flask",
                  position: 0,
                  is_published: true,
                }}
                fields={[
                  {
                    name: "title",
                    label: "Название",
                    placeholder: "Например: Химия",
                  },
                  {
                    name: "icon_name",
                    label: "Иконка",
                    type: "select",
                    options: iconOptions,
                  },
                  {
                    name: "position",
                    label: "Позиция",
                    type: "number",
                  },
                  {
                    name: "description",
                    label: "Описание",
                    type: "textarea",
                    full: true,
                  },
                  {
                    name: "is_published",
                    type: "checkbox",
                    checkboxLabel: "Показывать на сайте",
                    full: true,
                  },
                ]}
              />
            )}

            {activeSection === "achievements" && (
              <SimpleCollectionManager
                tableName="achievements"
                title="достижение"
                description="Добавляй сертификаты, курсы, конкурсы и достижения учеников."
                emptyItem={{
                  title: "",
                  description: "",
                  year: "",
                  position: 0,
                  is_published: true,
                }}
                fields={[
                  {
                    name: "title",
                    label: "Название",
                    placeholder: "Например: Курсы повышения квалификации",
                  },
                  {
                    name: "year",
                    label: "Год",
                    placeholder: "2026",
                  },
                  {
                    name: "position",
                    label: "Позиция",
                    type: "number",
                  },
                  {
                    name: "description",
                    label: "Описание",
                    type: "textarea",
                    full: true,
                  },
                  {
                    name: "is_published",
                    type: "checkbox",
                    checkboxLabel: "Показывать на сайте",
                    full: true,
                  },
                ]}
              />
            )}

            {activeSection === "reviews" && (
              <SimpleCollectionManager
                tableName="reviews"
                title="отзыв"
                description="Добавляй отзывы учеников и родителей."
                emptyItem={{
                  name: "",
                  text: "",
                  rating: 5,
                  position: 0,
                  is_published: true,
                }}
                fields={[
                  {
                    name: "name",
                    label: "Имя / подпись",
                    placeholder: "Например: Родитель ученика",
                  },
                  {
                    name: "rating",
                    label: "Оценка",
                    type: "number",
                  },
                  {
                    name: "position",
                    label: "Позиция",
                    type: "number",
                  },
                  {
                    name: "text",
                    label: "Текст отзыва",
                    type: "textarea",
                    full: true,
                  },
                  {
                    name: "is_published",
                    type: "checkbox",
                    checkboxLabel: "Показывать на сайте",
                    full: true,
                  },
                ]}
              />
            )}

            {activeSection === "gallery" && (
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                  <Award className="h-7 w-7" />
                </div>

                <h3 className="text-2xl font-bold">Галерея будет следующим этапом</h3>

                <p className="mt-3 text-slate-300">
                  Сейчас полностью работают профиль, направления, материалы,
                  достижения, отзывы и контакты. Галерею с загрузкой фото через
                  Supabase Storage подключим отдельно, чтобы не сломать текущую
                  стабильную версию.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminDashboard;