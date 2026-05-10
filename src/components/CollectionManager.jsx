import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Loader2,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "../lib/supabase";

const configs = {
  advantages: {
    table: "advantages",
    title: "Преимущества",
    addTitle: "Добавить преимущество",
    editTitle: "Редактировать преимущество",
    emptyText: "Преимуществ пока нет.",
    orderField: "sort_order",
    orderAscending: true,
    defaultForm: {
      title: "",
      text: "",
      sort_order: 0,
      is_published: true,
    },
    fields: [
      {
        name: "title",
        label: "Короткий заголовок",
        type: "text",
        placeholder: "Индивидуальный подход",
      },
      {
        name: "text",
        label: "Текст преимущества",
        type: "textarea",
        placeholder: "Индивидуальный подход к каждому ученику",
      },
      {
        name: "sort_order",
        label: "Порядок",
        type: "number",
        placeholder: "1",
      },
      {
        name: "is_published",
        label: "Показывать на сайте",
        type: "checkbox",
      },
    ],
  },

  services: {
    table: "services",
    title: "Направления работы",
    addTitle: "Добавить направление",
    editTitle: "Редактировать направление",
    emptyText: "Направлений пока нет.",
    orderField: "sort_order",
    orderAscending: true,
    defaultForm: {
      icon: "flask",
      title: "",
      text: "",
      sort_order: 0,
      is_published: true,
    },
    fields: [
      {
        name: "icon",
        label: "Иконка",
        type: "select",
        options: [
          { value: "flask", label: "Колба / химия" },
          { value: "dna", label: "ДНК / биология" },
          { value: "graduation", label: "Обучение / экзамены" },
          { value: "book", label: "Книга / материалы" },
          { value: "microscope", label: "Микроскоп" },
          { value: "atom", label: "Атом" },
        ],
      },
      {
        name: "title",
        label: "Название направления",
        type: "text",
        placeholder: "Химия",
      },
      {
        name: "text",
        label: "Описание",
        type: "textarea",
        placeholder: "Объяснение сложных тем простым языком...",
      },
      {
        name: "sort_order",
        label: "Порядок",
        type: "number",
        placeholder: "1",
      },
      {
        name: "is_published",
        label: "Показывать на сайте",
        type: "checkbox",
      },
    ],
  },

  achievements: {
    table: "achievements",
    title: "Достижения",
    addTitle: "Добавить достижение",
    editTitle: "Редактировать достижение",
    emptyText: "Достижений пока нет.",
    orderField: "sort_order",
    orderAscending: true,
    defaultForm: {
      title: "",
      text: "",
      description: "",
      year: "",
      sort_order: 0,
      is_published: true,
    },
    fields: [
      {
        name: "title",
        label: "Название достижения",
        type: "text",
        placeholder: "Современные методики обучения",
      },
      {
        name: "text",
        label: "Описание",
        type: "textarea",
        placeholder: "Использование наглядных схем и интерактивных заданий...",
      },
      {
        name: "description",
        label: "Дополнительное описание",
        type: "textarea",
        placeholder: "Можно оставить пустым",
      },
      {
        name: "year",
        label: "Год",
        type: "text",
        placeholder: "2026",
      },
      {
        name: "sort_order",
        label: "Порядок",
        type: "number",
        placeholder: "1",
      },
      {
        name: "is_published",
        label: "Показывать на сайте",
        type: "checkbox",
      },
    ],
  },

  reviews: {
    table: "reviews",
    title: "Отзывы",
    addTitle: "Добавить отзыв",
    editTitle: "Редактировать отзыв",
    emptyText: "Отзывов пока нет.",
    orderField: "created_at",
    orderAscending: false,
    defaultForm: {
      name: "",
      role: "",
      text: "",
      rating: 5,
      is_published: true,
    },
    fields: [
      {
        name: "name",
        label: "Имя / автор",
        type: "text",
        placeholder: "Родитель ученика",
      },
      {
        name: "role",
        label: "Роль",
        type: "text",
        placeholder: "Родитель / ученик",
      },
      {
        name: "text",
        label: "Текст отзыва",
        type: "textarea",
        placeholder: "Ребенок стал увереннее на уроках...",
      },
      {
        name: "rating",
        label: "Оценка",
        type: "number",
        placeholder: "5",
      },
      {
        name: "is_published",
        label: "Показывать на сайте",
        type: "checkbox",
      },
    ],
  },
};

function CollectionManager({ type }) {
  const config = configs[type];

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(config.defaultForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [successText, setSuccessText] = useState("");
  const [errorText, setErrorText] = useState("");

  const visibleFields = useMemo(() => config.fields, [config.fields]);

  async function loadItems({ silent = false } = {}) {
    setLoading(true);

    if (!silent) {
      setErrorText("");
    }

    let query = supabase.from(config.table).select("*");

    if (config.orderField) {
      query = query.order(config.orderField, {
        ascending: config.orderAscending ?? true,
      });
    }

    const { data, error } = await query;

    setLoading(false);

    if (error) {
      setErrorText(
        `Не удалось загрузить раздел “${config.title}”: ${error.message}`
      );
      return;
    }

    setItems(data || []);
  }

  useEffect(() => {
    setForm(config.defaultForm);
    setEditingId(null);
    setSuccessText("");
    setErrorText("");
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function updateForm(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(config.defaultForm);
    setEditingId(null);
    setErrorText("");
  }

  function startEdit(item) {
    const nextForm = { ...config.defaultForm };

    for (const field of config.fields) {
      nextForm[field.name] = item[field.name] ?? config.defaultForm[field.name];
    }

    setForm(nextForm);
    setEditingId(item.id);
    setSuccessText("");
    setErrorText("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function makePayload() {
    const payload = {};

    for (const field of config.fields) {
      const value = form[field.name];

      if (field.type === "checkbox") {
        payload[field.name] = Boolean(value);
      } else if (field.type === "number") {
        payload[field.name] = Number(value || 0);
      } else if (typeof value === "string") {
        payload[field.name] = value.trim();
      } else {
        payload[field.name] = value;
      }
    }

    return payload;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setSuccessText("");
    setErrorText("");

    const payload = makePayload();

    let result;

    if (editingId) {
      result = await supabase
        .from(config.table)
        .update(payload)
        .eq("id", editingId)
        .select();
    } else {
      result = await supabase
        .from(config.table)
        .insert(payload)
        .select();
    }

    setSaving(false);

    if (result.error) {
      setErrorText(`Не удалось сохранить данные: ${result.error.message}`);
      return;
    }

    const message = editingId ? "Изменения сохранены." : "Запись добавлена.";

    setForm(config.defaultForm);
    setEditingId(null);
    setSuccessText(message);

    await loadItems({ silent: true });
  }

  async function deleteItem(id) {
    const confirmed = window.confirm(
      "Удалить эту запись? Это действие нельзя отменить."
    );

    if (!confirmed) return;

    setErrorText("");
    setSuccessText("");

    const { error } = await supabase.from(config.table).delete().eq("id", id);

    if (error) {
      setErrorText(`Не удалось удалить запись: ${error.message}`);
      return;
    }

    setSuccessText("Запись удалена.");
    await loadItems({ silent: true });
  }

  function getItemTitle(item) {
    return item.title || item.name || item.text || "Без названия";
  }

  function getItemSubtitle(item) {
    if (type === "services") return item.text;
    if (type === "advantages") return item.text;
    if (type === "achievements") return item.text || item.description;
    if (type === "reviews") return item.text;
    return "";
  }

  function renderField(field) {
    if (field.type === "textarea") {
      return (
        <label key={field.name} className="block md:col-span-2">
          <span className="mb-2 block text-sm text-slate-300">
            {field.label}
          </span>

          <textarea
            value={form[field.name]}
            onChange={(event) => updateForm(field.name, event.target.value)}
            placeholder={field.placeholder || ""}
            rows="4"
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
          />
        </label>
      );
    }

    if (field.type === "select") {
      return (
        <label key={field.name} className="block">
          <span className="mb-2 block text-sm text-slate-300">
            {field.label}
          </span>

          <select
            value={form[field.name]}
            onChange={(event) => updateForm(field.name, event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none"
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    if (field.type === "checkbox") {
      return (
        <label
          key={field.name}
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 md:col-span-2"
        >
          <input
            type="checkbox"
            checked={Boolean(form[field.name])}
            onChange={(event) => updateForm(field.name, event.target.checked)}
            className="h-5 w-5"
          />

          <span className="text-sm text-slate-300">{field.label}</span>
        </label>
      );
    }

    return (
      <label key={field.name} className="block">
        <span className="mb-2 block text-sm text-slate-300">
          {field.label}
        </span>

        <input
          type={field.type}
          value={form[field.name]}
          onChange={(event) => updateForm(field.name, event.target.value)}
          placeholder={field.placeholder || ""}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white outline-none placeholder:text-slate-600"
        />
      </label>
    );
  }

  if (!config) {
    return (
      <div className="rounded-[2rem] border border-red-400/20 bg-red-400/10 p-8 text-red-200">
        Неизвестный тип раздела.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin" />
          Загружаем раздел “{config.title}”...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black">
              {editingId ? config.editTitle : config.addTitle}
            </h2>

            <p className="mt-2 text-slate-400">
              После сохранения данные автоматически подтянутся на главную
              страницу сайта после обновления страницы.
            </p>
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
          {visibleFields.map(renderField)}

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
            <p className="mt-2 text-slate-400">
              Всего записей: {items.length}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadItems()}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
          >
            Обновить
          </button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-6 text-slate-400">
            {config.emptyText}
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
                      {item.sort_order !== undefined && (
                        <span className="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">
                          Порядок: {item.sort_order}
                        </span>
                      )}

                      {item.year && (
                        <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-sm text-cyan-200">
                          {item.year}
                        </span>
                      )}

                      {item.rating && (
                        <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-sm text-yellow-200">
                          Оценка: {item.rating}
                        </span>
                      )}

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

                    <h3 className="text-xl font-bold">{getItemTitle(item)}</h3>

                    {getItemSubtitle(item) && (
                      <p className="mt-2 max-w-3xl leading-7 text-slate-300">
                        {getItemSubtitle(item)}
                      </p>
                    )}

                    {item.role && (
                      <p className="mt-2 text-sm text-slate-400">
                        {item.role}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
                    >
                      <Edit3 className="h-4 w-4" />
                      Изменить
                    </button>

                    <button
                      type="button"
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

export default CollectionManager;