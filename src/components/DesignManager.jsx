import { useEffect, useState } from "react";
import { Loader2, Palette, Save, Sparkles } from "lucide-react";
import { supabase } from "../lib/supabase";

const defaultDesign = {
  theme_preset: "science",
  background_style: "aurora",
  card_style: "glass",
  animation_style: "smooth",
  animation_intensity: "medium",
  rounded_style: "extra",
  glow_enabled: true,
  particles_enabled: true,
};

const selectOptions = {
  theme_preset: [
    { value: "science", label: "Science — cyan/emerald" },
    { value: "biology", label: "Biology — green/lime" },
    { value: "premium", label: "Premium — violet/blue" },
    { value: "sunset", label: "Sunset — orange/rose" },
  ],
  background_style: [
    { value: "aurora", label: "Aurora — мягкие градиенты" },
    { value: "grid", label: "Science Grid — сетка" },
    { value: "particles", label: "Particles — частицы" },
    { value: "dna", label: "DNA — диагональный узор" },
  ],
  card_style: [
    { value: "glass", label: "Glass — стеклянные карточки" },
    { value: "solid", label: "Solid — плотные карточки" },
    { value: "neon", label: "Neon — светящиеся карточки" },
  ],
  animation_style: [
    { value: "smooth", label: "Включены" },
    { value: "none", label: "Выключены" },
  ],
  animation_intensity: [
    { value: "soft", label: "Мягкая" },
    { value: "medium", label: "Средняя" },
    { value: "strong", label: "Сильная" },
  ],
  rounded_style: [
    { value: "extra", label: "Большие скругления" },
    { value: "soft", label: "Мягкие скругления" },
  ],
};

function DesignManager() {
  const [design, setDesign] = useState(defaultDesign);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");

  async function loadDesign() {
    setLoading(true);
    setSuccessText("");
    setErrorText("");

    const { data, error } = await supabase
      .from("site_design")
      .select("*")
      .eq("id", "main")
      .maybeSingle();

    setLoading(false);

    if (error) {
      setErrorText(`Не удалось загрузить дизайн: ${error.message}`);
      return;
    }

    if (data) {
      setDesign({
        ...defaultDesign,
        ...data,
      });
    }
  }

  useEffect(() => {
    loadDesign();
  }, []);

  function updateDesign(field, value) {
    setDesign((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setSuccessText("");
    setErrorText("");

    const payload = {
      id: "main",
      theme_preset: design.theme_preset,
      background_style: design.background_style,
      card_style: design.card_style,
      animation_style: design.animation_style,
      animation_intensity: design.animation_intensity,
      rounded_style: design.rounded_style,
      glow_enabled: Boolean(design.glow_enabled),
      particles_enabled: Boolean(design.particles_enabled),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("site_design")
      .upsert(payload, { onConflict: "id" });

    setSaving(false);

    if (error) {
      setErrorText(`Не удалось сохранить дизайн: ${error.message}`);
      return;
    }

    setSuccessText("Дизайн сайта сохранён.");
    await loadDesign();
  }

  function renderSelect(field, label, description) {
    return (
      <label className="block">
        <span className="mb-2 block text-sm text-slate-300">{label}</span>

        <select
          value={design[field]}
          onChange={(event) => updateDesign(field, event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
        >
          {selectOptions[field].map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </label>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем настройки дизайна...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
            <Palette className="h-7 w-7" />
          </div>

          <div>
            <h2 className="text-2xl font-black">Дизайн сайта</h2>
            <p className="mt-2 text-slate-400">
              Здесь можно менять общий стиль сайта: цвета, фон, карточки,
              анимации и визуальные эффекты.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          {renderSelect(
            "theme_preset",
            "Цветовая тема",
            "Главная палитра сайта: химия, биология, премиум или тёплый стиль."
          )}

          {renderSelect(
            "background_style",
            "Фон сайта",
            "Выбирает тип фонового эффекта: градиент, сетка, частицы или DNA-узор."
          )}

          {renderSelect(
            "card_style",
            "Стиль карточек",
            "Влияет на блоки, карточки материалов, отзывов, галереи и админки."
          )}

          {renderSelect(
            "animation_style",
            "Анимации",
            "Можно включить или выключить фоновые анимации."
          )}

          {renderSelect(
            "animation_intensity",
            "Интенсивность анимаций",
            "Скорость и заметность фоновых эффектов."
          )}

          {renderSelect(
            "rounded_style",
            "Скругления",
            "Форма карточек: большие современные скругления или более мягкие."
          )}

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
            <input
              type="checkbox"
              checked={design.glow_enabled}
              onChange={(event) =>
                updateDesign("glow_enabled", event.target.checked)
              }
              className="h-5 w-5"
            />

            <span className="text-sm text-slate-300">Включить свечение</span>
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
            <input
              type="checkbox"
              checked={design.particles_enabled}
              onChange={(event) =>
                updateDesign("particles_enabled", event.target.checked)
              }
              className="h-5 w-5"
            />

            <span className="text-sm text-slate-300">
              Включить частицы / узоры
            </span>
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
                Сохранить дизайн
              </>
            )}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-cyan-200" />
          <h2 className="text-2xl font-black">Предпросмотр стиля</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Тема</p>
            <p className="mt-2 text-xl font-bold">{design.theme_preset}</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Фон</p>
            <p className="mt-2 text-xl font-bold">{design.background_style}</p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Карточки</p>
            <p className="mt-2 text-xl font-bold">{design.card_style}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DesignManager;