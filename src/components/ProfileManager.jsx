import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Save, UserRound } from "lucide-react";
import { supabase } from "../lib/supabase";

const defaultProfile = {
  full_name: "",
  profession: "",

  hero_badge: "",
  hero_title: "",
  hero_highlight: "",
  hero_description: "",

  experience_value: "",
  experience_label: "",

  materials_value: "",
  materials_label: "",

  access_value: "",
  access_label: "",

  about_title: "",
  about_text: "",

  approach_title: "",
  approach_text: "",

  science_card_title: "",
  science_card_text: "",

  hero_photo_url: "",
  hero_photo_path: "",
  background_image_url: "",
  background_image_path: "",
  background_overlay_opacity: 0.72,
};

function ProfileManager() {
  const [profile, setProfile] = useState(defaultProfile);
  const [heroPhotoFile, setHeroPhotoFile] = useState(null);
  const [backgroundFile, setBackgroundFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");

  async function loadProfile() {
    setLoading(true);
    setSuccessText("");
    setErrorText("");

    const { data, error } = await supabase
      .from("site_profile")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    setLoading(false);

    if (error) {
      setErrorText(`Не удалось загрузить основную информацию: ${error.message}`);
      return;
    }

    if (data) {
      setProfile({
        ...defaultProfile,
        ...data,
        background_overlay_opacity: Number(
          data.background_overlay_opacity ?? 0.72
        ),
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

  function getFileExtension(file) {
    const parts = file.name.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "jpg";
  }

  async function uploadAsset(file, folder) {
    if (!file) return null;

    const extension = getFileExtension(file);
    const fileName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("site-assets")
      .getPublicUrl(fileName);

    return {
      url: data.publicUrl,
      path: fileName,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setSuccessText("");
    setErrorText("");

    try {
      const heroUpload = await uploadAsset(heroPhotoFile, "hero");
      const backgroundUpload = await uploadAsset(backgroundFile, "backgrounds");

      const payload = {
        id: "main",

        full_name: profile.full_name.trim(),
        profession: profile.profession.trim(),

        hero_badge: profile.hero_badge.trim(),
        hero_title: profile.hero_title.trim(),
        hero_highlight: profile.hero_highlight.trim(),
        hero_description: profile.hero_description.trim(),

        experience_value: profile.experience_value.trim(),
        experience_label: profile.experience_label.trim(),

        materials_value: profile.materials_value.trim(),
        materials_label: profile.materials_label.trim(),

        access_value: profile.access_value.trim(),
        access_label: profile.access_label.trim(),

        about_title: profile.about_title.trim(),
        about_text: profile.about_text.trim(),

        approach_title: profile.approach_title.trim(),
        approach_text: profile.approach_text.trim(),

        science_card_title: profile.science_card_title.trim(),
        science_card_text: profile.science_card_text.trim(),

        hero_photo_url: heroUpload?.url || profile.hero_photo_url || "",
        hero_photo_path: heroUpload?.path || profile.hero_photo_path || "",

        background_image_url:
          backgroundUpload?.url || profile.background_image_url || "",
        background_image_path:
          backgroundUpload?.path || profile.background_image_path || "",

        background_overlay_opacity: Number(
          profile.background_overlay_opacity || 0.72
        ),

        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("site_profile")
        .upsert(payload, { onConflict: "id" });

      if (error) {
        throw new Error(error.message);
      }

      setHeroPhotoFile(null);
      setBackgroundFile(null);
      setSuccessText("Основная информация успешно сохранена.");
      await loadProfile();
    } catch (error) {
      setErrorText(`Не удалось сохранить основную информацию: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем основную информацию...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
            <UserRound className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black">Основная информация</h2>
            <p className="mt-2 text-slate-400">
              Здесь редактируется главный экран, фото преподавателя, фоновое
              изображение, блок “Обо мне” и научная карточка.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-5 md:col-span-2">
            <div className="mb-5 flex items-center gap-3">
              <ImagePlus className="h-6 w-6 text-cyan-200" />
              <h3 className="text-xl font-bold">Фото и фон сайта</h3>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Фото преподавателя
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    setHeroPhotoFile(event.target.files?.[0] || null)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
                />

                {profile.hero_photo_url && (
                  <img
                    src={profile.hero_photo_url}
                    alt="Фото преподавателя"
                    className="mt-4 h-56 w-full rounded-2xl object-cover"
                  />
                )}
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">
                  Фоновое изображение сайта
                </span>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) =>
                    setBackgroundFile(event.target.files?.[0] || null)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
                />

                {profile.background_image_url && (
                  <img
                    src={profile.background_image_url}
                    alt="Фон сайта"
                    className="mt-4 h-56 w-full rounded-2xl object-cover"
                  />
                )}
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm text-slate-300">
                  Затемнение фона: {profile.background_overlay_opacity}
                </span>

                <input
                  type="range"
                  min="0.35"
                  max="0.9"
                  step="0.01"
                  value={profile.background_overlay_opacity}
                  onChange={(event) =>
                    updateProfile(
                      "background_overlay_opacity",
                      Number(event.target.value)
                    )
                  }
                  className="w-full"
                />

                <p className="mt-2 text-sm text-slate-500">
                  Меньше значение — фоновое изображение видно сильнее. Больше
                  значение — сайт темнее и текст читается лучше.
                </p>
              </label>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">ФИО</span>
            <input
              type="text"
              value={profile.full_name}
              onChange={(event) =>
                updateProfile("full_name", event.target.value)
              }
              placeholder="Алиосманова Кристина"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Профессия</span>
            <input
              type="text"
              value={profile.profession}
              onChange={(event) =>
                updateProfile("profession", event.target.value)
              }
              placeholder="Учитель химии и биологии"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">
              Бейдж первого экрана
            </span>
            <input
              type="text"
              value={profile.hero_badge}
              onChange={(event) =>
                updateProfile("hero_badge", event.target.value)
              }
              placeholder="Современное обучение химии и биологии"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Заголовок</span>
            <input
              type="text"
              value={profile.hero_title}
              onChange={(event) =>
                updateProfile("hero_title", event.target.value)
              }
              placeholder="Учитель"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Выделенный текст
            </span>
            <input
              type="text"
              value={profile.hero_highlight}
              onChange={(event) =>
                updateProfile("hero_highlight", event.target.value)
              }
              placeholder="химии и биологии"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">
              Описание первого экрана
            </span>
            <textarea
              value={profile.hero_description}
              onChange={(event) =>
                updateProfile("hero_description", event.target.value)
              }
              rows="4"
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 md:col-span-2">
            <h3 className="mb-4 text-lg font-bold">Цифры на первом экране</h3>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="grid gap-3">
                <input
                  type="text"
                  value={profile.experience_value}
                  onChange={(event) =>
                    updateProfile("experience_value", event.target.value)
                  }
                  placeholder="5+"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />

                <input
                  type="text"
                  value={profile.experience_label}
                  onChange={(event) =>
                    updateProfile("experience_label", event.target.value)
                  }
                  placeholder="лет опыта"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="grid gap-3">
                <input
                  type="text"
                  value={profile.materials_value}
                  onChange={(event) =>
                    updateProfile("materials_value", event.target.value)
                  }
                  placeholder="100+"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />

                <input
                  type="text"
                  value={profile.materials_label}
                  onChange={(event) =>
                    updateProfile("materials_label", event.target.value)
                  }
                  placeholder="материалов"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="grid gap-3">
                <input
                  type="text"
                  value={profile.access_value}
                  onChange={(event) =>
                    updateProfile("access_value", event.target.value)
                  }
                  placeholder="24/7"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />

                <input
                  type="text"
                  value={profile.access_label}
                  onChange={(event) =>
                    updateProfile("access_label", event.target.value)
                  }
                  placeholder="доступ к сайту"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>
          </div>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">
              Заголовок блока “Обо мне”
            </span>
            <input
              type="text"
              value={profile.about_title}
              onChange={(event) =>
                updateProfile("about_title", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">
              Текст блока “Обо мне”
            </span>
            <textarea
              value={profile.about_text}
              onChange={(event) =>
                updateProfile("about_text", event.target.value)
              }
              rows="4"
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Заголовок “Мой подход”
            </span>
            <input
              type="text"
              value={profile.approach_title}
              onChange={(event) =>
                updateProfile("approach_title", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Заголовок научной карточки
            </span>
            <input
              type="text"
              value={profile.science_card_title}
              onChange={(event) =>
                updateProfile("science_card_title", event.target.value)
              }
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">
              Текст “Мой подход”
            </span>
            <textarea
              value={profile.approach_text}
              onChange={(event) =>
                updateProfile("approach_text", event.target.value)
              }
              rows="4"
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">
              Текст научной карточки
            </span>
            <textarea
              value={profile.science_card_text}
              onChange={(event) =>
                updateProfile("science_card_text", event.target.value)
              }
              rows="4"
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
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
                Сохранить основную информацию
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileManager;