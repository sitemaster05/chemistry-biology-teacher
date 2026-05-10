function AdminLogin() {
  return (
    <main className="min-h-screen bg-slate-950 p-10 text-white">
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-black">Вход в админку</h1>
        <p className="mt-3 text-slate-300">
          Здесь позже будет авторизация через Supabase.
        </p>

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <input
            type="password"
            placeholder="Пароль"
            className="w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none"
          />

          <button className="w-full rounded-full bg-cyan-300 px-6 py-3 font-bold text-slate-950">
            Войти
          </button>
        </div>

        <a href="/" className="mt-6 block text-cyan-300">
          Вернуться на сайт
        </a>
      </div>
    </main>
  );
}

export default AdminLogin;