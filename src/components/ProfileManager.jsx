import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { supabase } from "../lib/supabase";

const emptyProfile = {
  teacher_name: "",
  teacher_title: "",
  hero_badge: "",
  hero_description: "",
  about_title: "",
  about_description: "",
  approach_title: "",
  approach_text: "",
  experience_value: "",
  experience_label: "",
  materials_value: "",
  materials_label: "",
  access_value: "",
  access_label: "",
};

function ProfileManager() {
  const [profile, setProfile] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");

  async function loadProfile() {
    setLoading(true);
    setErrorText("");
    setSuccessText("");

    const { data, error } = await supabase
      .from("site_profile")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    setLoading(false);

    if (error) {
      setErrorText("Не удалось загрузить профиль.");
      return;
    }

    if (data) {
      setProfile({
        teacher_name: data.teacher_name || "",
        teacher_title: data.teacher_title || "",
        hero_badge: data.hero_badge || "",
        hero_description: data.hero_description || "",
        about_title: data.about_title || "",
        about_description: data.about_description || "",
        approach_title: data.approach_title || "",
        approach_text: data.approach_text || "",
        experience_value: data.experience_value || "",
        experience_label: data.experience_label || "",
        materials_value: data.materials_value || "",
        materials_label: data.materials_label || "",
        access_value: data.access_value || "",
        access_label: data.access_label || "",
      });
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function updateProfile(field, value) {
    setProfile((current) => ({
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
      ...profile,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("site_profile")
      .upsert(payload, { onConflict: "id" });

    setSaving(false);

    if (error) {
      setErrorText("Не удалось сохранить профиль.");
      return;
    }

    setSuccessText("Профиль успешно сохранен.");
    await loadProfile();
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем профиль...
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black">Основная информация</h2>
        <p className="mt-2 text-slate-400">
          Эти данные отображаются на главной странице сайта.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">ФИО</span>
          <input
            type="text"
            value={profile.teacher_name}
            onChange={(event) =>
              updateProfile("teacher_name", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Должность</span>
          <input
            type="text"
            value={profile.teacher_title}
            onChange={(event) =>
              updateProfile("teacher_title", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">
            Бейдж на первом экране
          </span>
          <input
            type="text"
            value={profile.hero_badge}
            onChange={(event) => updateProfile("hero_badge", event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">
            Описание на первом экране
          </span>
          <textarea
            rows="4"
            value={profile.hero_description}
            onChange={(event) =>
              updateProfile("hero_description", event.target.value)
            }
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">
            Заголовок блока “Обо мне”
          </span>
          <input
            type="text"
            value={profile.about_title}
            onChange={(event) =>
              updateProfile("about_title", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">
            Заголовок карточки подхода
          </span>
          <input
            type="text"
            value={profile.approach_title}
            onChange={(event) =>
              updateProfile("approach_title", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">
            Описание блока “Обо мне”
          </span>
          <textarea
            rows="3"
            value={profile.about_description}
            onChange={(event) =>
              updateProfile("about_description", event.target.value)
            }
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block md:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">
            Текст подхода
          </span>
          <textarea
            rows="4"
            value={profile.approach_text}
            onChange={(event) =>
              updateProfile("approach_text", event.target.value)
            }
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">Опыт — число</span>
          <input
            type="text"
            value={profile.experience_value}
            onChange={(event) =>
              updateProfile("experience_value", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">
            Опыт — подпись
          </span>
          <input
            type="text"
            value={profile.experience_label}
            onChange={(event) =>
              updateProfile("experience_label", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">
            Материалы — число
          </span>
          <input
            type="text"
            value={profile.materials_value}
            onChange={(event) =>
              updateProfile("materials_value", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">
            Материалы — подпись
          </span>
          <input
            type="text"
            value={profile.materials_label}
            onChange={(event) =>
              updateProfile("materials_label", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">
            Доступ — число
          </span>
          <input
            type="text"
            value={profile.access_value}
            onChange={(event) =>
              updateProfile("access_value", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-slate-300">
            Доступ — подпись
          </span>
          <input
            type="text"
            value={profile.access_label}
            onChange={(event) =>
              updateProfile("access_label", event.target.value)
            }
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
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
              Сохранить профиль
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default ProfileManager;