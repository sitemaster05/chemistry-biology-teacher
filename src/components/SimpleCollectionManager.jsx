import { useEffect, useState } from "react";
import { Edit3, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { supabase } from "../lib/supabase";

function SimpleCollectionManager({
  tableName,
  title,
  description,
  emptyItem,
  fields,
  orderField = "position",
  orderAscending = true,
}) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyItem);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  async function loadItems() {
    setLoading(true);
    setErrorText("");
    setSuccessText("");

    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .order(orderField, { ascending: orderAscending });

    setLoading(false);

    if (error) {
      setErrorText("Не удалось загрузить данные.");
      return;
    }

    setItems(data || []);
  }

  useEffect(() => {
    loadItems();
  }, [tableName]);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyItem);
    setEditingId(null);
    setErrorText("");
    setSuccessText("");
  }

  function startEdit(item) {
    const nextForm = { ...emptyItem };

    Object.keys(nextForm).forEach((key) => {
      nextForm[key] = item[key] ?? emptyItem[key];
    });

    setForm(nextForm);
    setEditingId(item.id);
    setErrorText("");
    setSuccessText("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setErrorText("");
    setSuccessText("");

    const payload = { ...form };

    let result;

    if (editingId) {
      result = await supabase
        .from(tableName)
        .update(payload)
        .eq("id", editingId)
        .select()
        .single();
    } else {
      result = await supabase
        .from(tableName)
        .insert(payload)
        .select()
        .single();
    }

    setSaving(false);

    if (result.error) {
      setErrorText("Не удалось сохранить данные.");
      return;
    }

    setSuccessText("Данные успешно сохранены.");
    resetForm();
    await loadItems();
  }

  async function deleteItem(id) {
    const confirmed = window.confirm("Удалить запись? Это действие нельзя отменить.");

    if (!confirmed) return;

    const { error } = await supabase.from(tableName).delete().eq("id", id);

    if (error) {
      setErrorText("Не удалось удалить запись.");
      return;
    }

    await loadItems();
  }

  function renderField(field) {
    const value = form[field.name];

    if (field.type === "textarea") {
      return (
        <textarea
          rows={field.rows || 4}
          value={value || ""}
          onChange={(event) => updateForm(field.name, event.target.value)}
          placeholder={field.placeholder || ""}
          className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
        />
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={value || ""}
          onChange={(event) => updateForm(field.name, event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => updateForm(field.name, event.target.checked)}
            className="h-5 w-5"
          />
          <span className="text-sm text-slate-300">{field.checkboxLabel}</span>
        </label>
      );
    }

    if (field.type === "number") {
      return (
        <input
          type="number"
          value={value ?? 0}
          onChange={(event) =>
            updateForm(field.name, Number(event.target.value))
          }
          placeholder={field.placeholder || ""}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
        />
      );
    }

    return (
      <input
        type={field.type || "text"}
        value={value || ""}
        onChange={(event) => updateForm(field.name, event.target.value)}
        placeholder={field.placeholder || ""}
        className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {editingId ? `Редактировать: ${title}` : `Добавить: ${title}`}
            </h2>
            <p className="mt-2 text-slate-400">{description}</p>
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
          {fields.map((field) => (
            <label
              key={field.name}
              className={field.full ? "block md:col-span-2" : "block"}
            >
              {field.type !== "checkbox" && (
                <span className="mb-2 block text-sm text-slate-300">
                  {field.label}
                </span>
              )}

              {renderField(field)}
            </label>
          ))}

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
                Добавить
              </>
            )}
          </button>
        </form>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">Список</h2>
            <p className="mt-2 text-slate-400">Всего записей: {items.length}</p>
          </div>

          <button
            onClick={loadItems}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Обновить
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Загружаем...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-slate-400">
            Пока нет записей.
          </div>
        ) : (
          <div className="grid gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-5"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      {item.is_published !== undefined && (
                        <span
                          className={
                            item.is_published
                              ? "rounded-full bg-emerald-300/10 px-3 py-1 text-sm text-emerald-200"
                              : "rounded-full bg-red-300/10 px-3 py-1 text-sm text-red-200"
                          }
                        >
                          {item.is_published ? "Опубликовано" : "Скрыто"}
                        </span>
                      )}

                      {item.position !== undefined && (
                        <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                          Позиция: {item.position}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold">
                      {item.title || item.name || "Без названия"}
                    </h3>

                    {(item.description || item.text) && (
                      <p className="mt-2 max-w-3xl leading-7 text-slate-300">
                        {item.description || item.text}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => startEdit(item)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      <Edit3 className="h-4 w-4" />
                      Изменить
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
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

export default SimpleCollectionManager;