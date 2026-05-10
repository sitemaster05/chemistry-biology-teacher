import { useEffect, useState } from "react";
import {
  Edit3,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const emptyForm = {
  title: "",
  subject: "Химия",
  grade: "",
  description: "",
  link_url: "",
  is_published: true,
};

function MaterialsManager() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function loadMaterials() {
    setLoading(true);
    setErrorText("");

    const { data, error } = await supabase
      .from("materials")
      .select("*")
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setErrorText("Не удалось загрузить материалы.");
      return;
    }

    setMaterials(data || []);
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setErrorText("");
  }

  function startEdit(material) {
    setEditingId(material.id);

    setForm({
      title: material.title || "",
      subject: material.subject || "Химия",
      grade: material.grade || "",
      description: material.description || "",
      link_url: material.link_url || "",
      is_published: Boolean(material.is_published),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setErrorText("Введите название материала.");
      return;
    }

    if (!form.subject.trim()) {
      setErrorText("Введите предмет.");
      return;
    }

    setSaving(true);
    setErrorText("");

    const payload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      grade: form.grade.trim(),
      description: form.description.trim(),
      link_url: form.link_url.trim(),
      is_published: form.is_published,
    };

    let result;

    if (editingId) {
      result = await supabase
        .from("materials")
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
    } else {
      result = await supabase
        .from("materials")
        .insert(payload)
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      setErrorText("Не удалось сохранить материал.");
      return;
    }

    resetForm();
    await loadMaterials();
  }

  async function deleteMaterial(id) {
    const isConfirmed = window.confirm(
      "Удалить этот материал? Это действие нельзя отменить."
    );

    if (!isConfirmed) return;

    const { error } = await supabase.from("materials").delete().eq("id", id);

    if (error) {
      setErrorText("Не удалось удалить материал.");
      return;
    }

    await loadMaterials();
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {editingId ? "Редактировать материал" : "Добавить материал"}
            </h2>
            <p className="mt-2 text-slate-400">
              Эти материалы позже будут отображаться на главной странице сайта.
            </p>
          </div>

          {editingId && (
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
              Отмена
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Название материала
            </span>
            <input
              type="text"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              placeholder="Например: Строение атома"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Предмет</span>
            <select
              value={form.subject}
              onChange={(event) => updateForm("subject", event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
            >
              <option value="Химия">Химия</option>
              <option value="Биология">Биология</option>
              <option value="Химия и биология">Химия и биология</option>
              <option value="Подготовка к экзаменам">
                Подготовка к экзаменам
              </option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Класс</span>
            <input
              type="text"
              value={form.grade}
              onChange={(event) => updateForm("grade", event.target.value)}
              placeholder="Например: 8 класс"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Ссылка на материал
            </span>
            <input
              type="url"
              value={form.link_url}
              onChange={(event) => updateForm("link_url", event.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">Описание</span>
            <textarea
              value={form.description}
              onChange={(event) =>
                updateForm("description", event.target.value)
              }
              placeholder="Кратко опиши, что внутри материала..."
              rows="4"
              className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 md:col-span-2">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(event) =>
                updateForm("is_published", event.target.checked)
              }
              className="h-5 w-5"
            />
            <span className="text-sm text-slate-300">
              Показывать этот материал на сайте
            </span>
          </label>

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
            ) : editingId ? (
              <>
                <Save className="h-5 w-5" />
                Сохранить изменения
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Добавить материал
              </>
            )}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Список материалов</h2>
            <p className="mt-2 text-slate-400">
              Всего материалов: {materials.length}
            </p>
          </div>

          <button
            onClick={loadMaterials}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Обновить
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Загружаем материалы...
          </div>
        ) : materials.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-slate-400">
            Материалов пока нет. Добавь первый материал через форму выше.
          </div>
        ) : (
          <div className="grid gap-4">
            {materials.map((material) => (
              <div
                key={material.id}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm text-cyan-200">
                        {material.subject}
                      </span>

                      {material.grade && (
                        <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                          {material.grade}
                        </span>
                      )}

                      <span
                        className={
                          material.is_published
                            ? "rounded-full bg-emerald-300/10 px-3 py-1 text-sm text-emerald-200"
                            : "rounded-full bg-red-300/10 px-3 py-1 text-sm text-red-200"
                        }
                      >
                        {material.is_published ? "Опубликовано" : "Скрыто"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold">{material.title}</h3>

                    {material.description && (
                      <p className="mt-2 max-w-3xl leading-7 text-slate-300">
                        {material.description}
                      </p>
                    )}

                    {material.link_url && (
                      <a
                        href={material.link_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-sm text-cyan-300 hover:text-cyan-200"
                      >
                        Открыть ссылку
                      </a>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => startEdit(material)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      <Edit3 className="h-4 w-4" />
                      Изменить
                    </button>

                    <button
                      onClick={() => deleteMaterial(material.id)}
                      className="inline-flex items-center gap-2 rounded-full bg-red-400/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-400/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MaterialsManager;