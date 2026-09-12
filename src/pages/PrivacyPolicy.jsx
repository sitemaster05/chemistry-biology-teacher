import { Link } from "react-router-dom";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

const policySections = [
  {
    title: "Какие данные собираются",
    text: "Через форму обратной связи посетитель может оставить имя, телефон, email или ник в Telegram, а также текст сообщения. Эти данные нужны только для ответа на обращение и обсуждения занятий.",
  },
  {
    title: "Как используются данные",
    text: "Данные не передаются третьим лицам для рекламы или рассылок. Сообщение может быть сохранено в административной панели сайта и отправлено на email преподавателя, чтобы не потерять заявку.",
  },
  {
    title: "Срок хранения",
    text: "Обращения хранятся столько, сколько необходимо для обработки заявки и ведения переписки. По просьбе посетителя сообщение и контактные данные могут быть удалены.",
  },
  {
    title: "Защита данных",
    text: "Доступ к сообщениям ограничен административной частью сайта. Для передачи данных используются обычные технические средства сайта и подключенных сервисов хранения/почты.",
  },
  {
    title: "Права посетителя",
    text: "Можно запросить уточнение, исправление или удаление своих контактных данных, написав по контактам, указанным на сайте.",
  },
];

function PrivacyPolicy() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6 lg:py-12">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(103,232,249,0.16),transparent_32%),radial-gradient(circle_at_82%_8%,rgba(134,239,172,0.12),transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_100%)]" />

      <section className="relative z-10 mx-auto max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:text-cyan-100"
        >
          <ArrowLeft className="h-4 w-4" />
          На главную
        </Link>

        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200 ring-1 ring-cyan-300/20">
            <ShieldCheck className="h-7 w-7" />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Политика конфиденциальности
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
            Обработка персональных данных на сайте
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            Эта политика объясняет, какие данные собираются через форму
            обратной связи и как они используются. Дата обновления: 12 сентября
            2026 года.
          </p>

          <div className="mt-9 space-y-4">
            {policySections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
              >
                <h2 className="text-lg font-bold text-white">
                  {section.title}
                </h2>
                <p className="mt-2 leading-7 text-slate-300">{section.text}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-5 text-slate-200">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 shrink-0 text-cyan-200" />
              <p className="leading-7">
                По вопросам обработки или удаления данных используйте контакты
                на главной странице сайта. Если на сайте указан email, можно
                написать напрямую на него.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PrivacyPolicy;
