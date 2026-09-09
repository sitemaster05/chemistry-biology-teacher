import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCheck,
  Clock,
  Inbox,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Send,
  Trash2,
} from "lucide-react";
import { supabase } from "../lib/supabase";

function detectContactLink(value) {
  const rawValue = String(value || "").trim();

  if (!rawValue) {
    return { type: "text", href: "", label: value };
  }

  // Telegram: @username или ссылка t.me
  if (/^@?[a-zA-Z0-9_]{5,32}$/.test(rawValue) && rawValue.startsWith("@")) {
    return {
      type: "telegram",
      href: `https://t.me/${rawValue.replace(/^@/, "")}`,
      label: value,
    };
  }

  if (/t\.me|telegram/i.test(rawValue)) {
    return { type: "telegram", href: rawValue, label: value };
  }

  // Email
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(rawValue)) {
    return { type: "email", href: `mailto:${rawValue}`, label: value };
  }

  // Телефон: +7..., 8..., или только цифры (от 10)
  const digits = rawValue.replace(/[^\d]/g, "");

  if (/^[+\d][\d\s()\-+]{8,}$/.test(rawValue) && digits.length >= 10) {
    return { type: "phone", href: `tel:${rawValue.replace(/[^\d+]/g, "")}`, label: value };
  }

  return { type: "text", href: "", label: value };
}

function ContactLinkBadge({ value }) {
  const contact = detectContactLink(value);

  if (!contact.href) {
    return <span className="font-semibold text-white">{value}</span>;
  }

  const icons = {
    telegram: Send,
    email: Mail,
    phone: Phone,
    text: MessageCircle,
  };

  const Icon = icons[contact.type] || MessageCircle;

  return (
    <a
      href={contact.href}
      target={contact.type === "telegram" ? "_blank" : undefined}
      rel={contact.type === "telegram" ? "noreferrer" : undefined}
      className="inline-flex max-w-full items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{contact.label}</span>
    </a>
  );
}

function formatMessageDate(isoString) {
  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MessagesManager({ onUnreadCountChange }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [setupMissing, setSetupMissing] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState("all");

  const loadMessages = useCallback(async () => {
    setErrorText("");
    setSuccessText("");

    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      const missingTable = /contact_messages|PGRST205|does not exist|not found|404/i.test(
        `${error.message || ""} ${error.code || ""}`
      );

      if (missingTable) {
        setSetupMissing(true);
      } else {
        setErrorText(`Не удалось загрузить сообщения: ${error.message}`);
      }

      return;
    }

    setSetupMissing(false);
    setMessages(data || []);

    if (onUnreadCountChange) {
      onUnreadCountChange((data || []).filter((item) => !item.is_read).length);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const filteredMessages = useMemo(() => {
    if (filter === "unread") {
      return messages.filter((message) => !message.is_read);
    }

    return messages;
  }, [messages, filter]);

  const unreadCount = messages.filter((message) => !message.is_read).length;

  async function toggleRead(message) {
    setBusyId(message.id);
    setErrorText("");
    setSuccessText("");

    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: !message.is_read })
      .eq("id", message.id);

    setBusyId(null);

    if (error) {
      setErrorText(`Не удалось обновить сообщение: ${error.message}`);
      return;
    }

    const nextMessages = messages.map((item) =>
      item.id === message.id ? { ...item, is_read: !item.is_read } : item
    );

    setMessages(nextMessages);

    if (onUnreadCountChange) {
      onUnreadCountChange(nextMessages.filter((item) => !item.is_read).length);
    }
  }

  async function deleteMessage(message) {
    const confirmed = window.confirm(
      `Удалить сообщение от «${message.name}»? Это действие нельзя отменить.`
    );

    if (!confirmed) return;

    setBusyId(message.id);
    setErrorText("");
    setSuccessText("");

    const { error } = await supabase
      .from("contact_messages")
      .delete()
      .eq("id", message.id);

    setBusyId(null);

    if (error) {
      setErrorText(`Не удалось удалить сообщение: ${error.message}`);
      return;
    }

    const nextMessages = messages.filter((item) => item.id !== message.id);

    setMessages(nextMessages);
    setSuccessText("Сообщение удалено.");

    if (onUnreadCountChange) {
      onUnreadCountChange(nextMessages.filter((item) => !item.is_read).length);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем сообщения...
        </div>
      </div>
    );
  }

  if (setupMissing) {
    return (
      <div className="space-y-5 rounded-[2rem] border border-amber-400/20 bg-amber-400/5 p-8 backdrop-blur-xl">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-400/10 text-amber-200">
            <Inbox className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">
              Таблица сообщений ещё не создана
            </h2>

            <p className="mt-3 leading-7 text-slate-300">
              Чтобы форма обратной связи на сайте начала работать, нужно один
              раз выполнить SQL-скрипт в Supabase:
            </p>

            <ol className="mt-4 list-decimal space-y-2 pl-5 text-slate-300">
              <li>
                Откройте{" "}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-cyan-200 underline underline-offset-4"
                >
                  Supabase Dashboard
                </a>{" "}
                и выберите ваш проект.
              </li>
              <li>
                Слева откройте раздел <b>SQL Editor</b> (Редактор SQL).
              </li>
              <li>
                Откройте файл <b>supabase-setup.sql</b> из папки проекта,
                скопируйте всё его содержимое, вставьте в редактор и нажмите{" "}
                <b>Run</b>.
              </li>
              <li>
                Вернитесь сюда и нажмите «Обновить» — сообщения начнут
                появляться автоматически.
              </li>
            </ol>
          </div>
        </div>

        <button
          type="button"
          onClick={loadMessages}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4" />
          Обновить
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black">Сообщения с сайта</h2>
            <p className="mt-2 text-slate-400">
              Всего: {messages.length}
              {unreadCount > 0
                ? ` · Непрочитанных: ${unreadCount}`
                : " · Все прочитаны"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-full border border-white/10 bg-slate-950/60 p-1">
              {[
                { value: "all", label: "Все" },
                { value: "unread", label: "Непрочитанные" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFilter(option.value)}
                  className={
                    filter === option.value
                      ? "rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
                      : "rounded-full px-4 py-2 text-sm text-slate-300 transition hover:text-white"
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={loadMessages}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Обновить
            </button>
          </div>
        </div>

        {successText && (
          <div className="mb-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            {successText}
          </div>
        )}

        {errorText && (
          <div className="mb-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {errorText}
          </div>
        )}

        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-slate-900/80 p-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
              <Inbox className="h-7 w-7" />
            </div>

            <h3 className="text-lg font-bold text-white">
              {filter === "unread"
                ? "Непрочитанных сообщений нет"
                : "Сообщений пока нет"}
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
              Когда посетитель отправит сообщение через форму в разделе
              «Контакты», оно появится здесь.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredMessages.map((message) => (
              <article
                key={message.id}
                className={
                  message.is_read
                    ? "rounded-2xl border border-white/10 bg-slate-900/80 p-5"
                    : "rounded-2xl border border-cyan-300/25 bg-slate-900/80 p-5 shadow-[0_0_30px_rgba(103,232,249,0.06)]"
                }
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {!message.is_read && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-300/15 px-3 py-1 text-sm font-semibold text-cyan-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                          Новое
                        </span>
                      )}

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-sm text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {formatMessageDate(message.created_at)}
                      </span>
                    </div>

                    <h3 className="break-words text-xl font-bold text-white">
                      {message.name}
                    </h3>

                    <div className="mt-3">
                      <ContactLinkBadge value={message.contact} />
                    </div>

                    <p className="mt-4 whitespace-pre-line break-words leading-7 text-slate-300">
                      {message.message}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRead(message)}
                      disabled={busyId === message.id}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busyId === message.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : message.is_read ? (
                        <CheckCheck className="h-4 w-4" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}

                      {message.is_read ? "Непрочитано" : "Прочитано"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteMessage(message)}
                      disabled={busyId === message.id}
                      className="inline-flex items-center gap-2 rounded-full bg-red-400/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesManager;
