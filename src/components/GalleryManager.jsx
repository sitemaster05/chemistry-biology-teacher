import { useEffect, useState } from "react";
import {
  Edit3,
  ImagePlus,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const emptyForm = {
  title: "",
  description: "",
  sort_order: 0,
  is_published: true,
};

function GalleryManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editingImageUrl, setEditingImageUrl] = useState("");
  const [editingStoragePath, setEditingStoragePath] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");

  async function loadGallery() {
    setLoading(true);
    setErrorText("");

    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      setErrorText(`Не удалось загрузить галерею: ${error.message}`);
      return;
    }

    setItems(data || []);
  }

  useEffect(() => {
    loadGallery();
  }, []);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setFile(null);
    setEditingId(null);
    setEditingImageUrl("");
    setEditingStoragePath("");
    setErrorText("");
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditingImageUrl(item.image_url || "");
    setEditingStoragePath(item.storage_path || "");

    setForm({
      title: item.title || "",
      description: item.description || "",
      sort_order: Number(item.sort_order || 0),
      is_published: Boolean(item.is_published),
    });

    setFile(null);
    setSuccessText("");
    setErrorText("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getFileExtension(selectedFile) {
    const nameParts = selectedFile.name.split(".");
    return nameParts.length > 1 ? nameParts.pop().toLowerCase() : "jpg";
  }

  async function uploadImage() {
    if (!file) {
      return {
        imageUrl: editingImageUrl,
        storagePath: editingStoragePath,
      };
    }

    const extension = getFileExtension(file);
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const storagePath = `photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("gallery")
      .getPublicUrl(storagePath);

    return {
      imageUrl: data.publicUrl,
      storagePath,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setSuccessText("");
    setErrorText("");

    try {
      if (!editingId && !file) {
        setErrorText("Выберите изображение для загрузки.");
        setSaving(false);
        return;
      }

      const { imageUrl, storagePath } = await uploadImage();

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        sort_order: Number(form.sort_order || 0),
        is_published: form.is_published,
        image_url: imageUrl,
        storage_path: storagePath,
      };

      let result;

      if (editingId) {
        result = await supabase
          .from("gallery")
          .update(payload)
          .eq("id", editingId)
          .select();
      } else {
        result = await supabase.from("gallery").insert(payload).select();
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      setSuccessText(editingId ? "Фото обновлено." : "Фото добавлено.");
      resetForm();
      await loadGallery();
    } catch (error) {
      setErrorText(`Не удалось сохранить фото: ${error.message}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteGalleryItem(item) {
    const confirmed = window.confirm(
      "Удалить это фото из галереи? Это действие нельзя отменить."
    );

    if (!confirmed) return;

    setErrorText("");
    setSuccessText("");

    const { error } = await supabase.from("gallery").delete().eq("id", item.id);

    if (error) {
      setErrorText(`Не удалось удалить запись: ${error.message}`);
      return;
    }

    if (item.storage_path) {
      await supabase.storage.from("gallery").remove([item.storage_path]);
    }

    setSuccessText("Фото удалено.");
    await loadGallery();
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем галерею...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
              <ImagePlus className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {editingId ? "Редактировать фото" : "Добавить фото"}
              </h2>

              <p className="mt-2 text-slate-400">
                Загружай фото кабинета, уроков, мероприятий, лабораторных работ
                или учебных материалов.
              </p>
            </div>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <X className="h-4 w-4" />
              Отмена
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm text-slate-300">
              Изображение
            </span>

            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none file:mr-4 file:rounded-full file:border-0 file:bg-cyan-300 file:px-4 file:py-2 file:font-semibold file:text-slate-950"
            />

            {editingId && editingImageUrl && (
              <p className="mt-2 text-sm text-slate-400">
                Если не выбрать новое фото, останется текущее изображение.
              </p>
            )}
          </label>

          {editingImageUrl && (
            <div className="md:col-span-2">
              <p className="mb-2 text-sm text-slate-300">Текущее фото</p>
              <img
                src={editingImageUrl}
                alt="Текущее фото"
                className="h-48 w-full rounded-2xl object-cover"
              />
            </div>
          )}

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">
              Название
            </span>

            <input
              type="text"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
              placeholder="Лабораторная работа"
              className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Порядок</span>

            <input
              type="number"
              value={form.sort_order}
              onChange={(event) =>
                updateForm("sort_order", event.target.value)
              }
              placeholder="1"
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
              placeholder="Краткое описание фотографии..."
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
              Показывать это фото на сайте
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
            ) : editingId ? (
              <>
                <Save className="h-5 w-5" />
                Сохранить изменения
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                Добавить фото
              </>
            )}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Фото в галерее</h2>
            <p className="mt-2 text-slate-400">Всего фото: {items.length}</p>
          </div>

          <button
            type="button"
            onClick={loadGallery}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Обновить
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-slate-400">
            В галерее пока нет фотографий.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/80"
              >
                <img
                  src={item.image_url}
                  alt={item.title || "Фото галереи"}
                  className="h-56 w-full object-cover"
                />

                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                      Порядок: {item.sort_order}
                    </span>

                    <span
                      className={
                        item.is_published
                          ? "rounded-full bg-emerald-300/10 px-3 py-1 text-sm text-emerald-200"
                          : "rounded-full bg-red-300/10 px-3 py-1 text-sm text-red-200"
                      }
                    >
                      {item.is_published ? "Опубликовано" : "Скрыто"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold">
                    {item.title || "Без названия"}
                  </h3>

                  {item.description && (
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-5 flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      <Edit3 className="h-4 w-4" />
                      Изменить
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteGalleryItem(item)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-red-400/10 px-4 py-2 text-sm text-red-200 transition hover:bg-red-400/20"
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

export default GalleryManager;