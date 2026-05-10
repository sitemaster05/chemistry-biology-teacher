function AdminDashboard() {
  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-4xl font-black">Админ-панель</h1>
          <p className="mt-3 text-slate-300">
            Здесь позже будут разделы для редактирования сайта.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <h2 className="text-xl font-bold">Материалы</h2>
              <p className="mt-2 text-slate-400">Добавление учебных материалов.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <h2 className="text-xl font-bold">Отзывы</h2>
              <p className="mt-2 text-slate-400">Добавление отзывов.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
              <h2 className="text-xl font-bold">Контакты</h2>
              <p className="mt-2 text-slate-400">Редактирование телефона и ссылок.</p>
            </div>
          </div>

          <a href="/" className="mt-8 block text-cyan-300">
            Вернуться на сайт
          </a>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;