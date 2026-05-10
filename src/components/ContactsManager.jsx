import { useEffect, useState } from "react";
import {
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Save,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const emptyContacts = {
  phone: "",
  email: "",
  telegram_url: "",
  whatsapp_url: "",
  city: "",
  address: "",
  map_url: "",
};

function ContactsManager() {
  const [contacts, setContacts] = useState(emptyContacts);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");

  async function loadContacts() {
    setLoading(true);
    setErrorText("");
    setSuccessText("");

    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    setLoading(false);

    if (error) {
      setErrorText("Не удалось загрузить контакты.");
      return;
    }

    if (data) {
      setContacts({
        phone: data.phone || "",
        email: data.email || "",
        telegram_url: data.telegram_url || "",
        whatsapp_url: data.whatsapp_url || "",
        city: data.city || "",
        address: data.address || "",
        map_url: data.map_url || "",
      });
    }
  }

  useEffect(() => {
    loadContacts();
  }, []);

  function updateContacts(field, value) {
    setContacts((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setErrorText("");
    setSuccessText("");

    const payload = {
      id: "main",
      phone: contacts.phone.trim(),
      email: contacts.email.trim(),
      telegram_url: contacts.telegram_url.trim(),
      whatsapp_url: contacts.whatsapp_url.trim(),
      city: contacts.city.trim(),
      address: contacts.address.trim(),
      map_url: contacts.map_url.trim(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("contacts")
      .upsert(payload, { onConflict: "id" });

    setSaving(false);

    if (error) {
      setErrorText("Не удалось сохранить контакты.");
      return;
    }

    setSuccessText("Контакты успешно сохранены.");
    await loadContacts();
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем контакты...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-black">Редактировать контакты</h2>
          <p className="mt-2 text-slate-400">
            Здесь можно менять данные, которые позже будут отображаться на
            главной странице сайта.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <Phone className="h-4 w-4 text-cyan-200" />
              Телефон
            </span>

            <input
              type="text"
              value={contacts.phone}
              onChange={(event) => updateContacts("phone", event.target.value)}
              placeholder="+7 999 999-99-99"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <Mail className="h-4 w-4 text-cyan-200" />
              Email
            </span>

            <input
              type="email"
              value={contacts.email}
              onChange={(event) => updateContacts("email", event.target.value)}
              placeholder="teacher@example.com"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <MessageCircle className="h-4 w-4 text-cyan-200" />
              Telegram-ссылка
            </span>

            <input
              type="url"
              value={contacts.telegram_url}
              onChange={(event) =>
                updateContacts("telegram_url", event.target.value)
              }
              placeholder="https://t.me/username"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <MessageCircle className="h-4 w-4 text-cyan-200" />
              WhatsApp-ссылка
            </span>

            <input
              type="url"
              value={contacts.whatsapp_url}
              onChange={(event) =>
                updateContacts("whatsapp_url", event.target.value)
              }
              placeholder="https://wa.me/79999999999"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="h-4 w-4 text-cyan-200" />
              Город / формат
            </span>

            <input
              type="text"
              value={contacts.city}
              onChange={(event) => updateContacts("city", event.target.value)}
              placeholder="Москва / онлайн-занятия"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="h-4 w-4 text-cyan-200" />
              Адрес
            </span>

            <input
              type="text"
              value={contacts.address}
              onChange={(event) =>
                updateContacts("address", event.target.value)
              }
              placeholder="Адрес школы или кабинета"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="h-4 w-4 text-cyan-200" />
              Ссылка на карту
            </span>

            <input
              type="url"
              value={contacts.map_url}
              onChange={(event) => updateContacts("map_url", event.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          {successText && (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200 md:col-span-2">
              {successText}
            </div>
          )}

          {errorText && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200 md:col-span-2">
              {errorText}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-300 px-6 py-4 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Сохраняем...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Сохранить контакты
              </>
            )}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="text-2xl font-black">Предпросмотр</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Телефон</p>
            <p className="mt-1 font-semibold text-white">
              {contacts.phone || "Не указан"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Email</p>
            <p className="mt-1 font-semibold text-white">
              {contacts.email || "Не указан"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">Telegram</p>
            <p className="mt-1 break-all font-semibold text-white">
              {contacts.telegram_url || "Не указан"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
            <p className="text-sm text-slate-400">WhatsApp</p>
            <p className="mt-1 break-all font-semibold text-white">
              {contacts.whatsapp_url || "Не указан"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 md:col-span-2">
            <p className="text-sm text-slate-400">Город / формат</p>
            <p className="mt-1 font-semibold text-white">
              {contacts.city || "Не указан"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactsManager;