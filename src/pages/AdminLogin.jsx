import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Atom, Lock, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setErrorText("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setErrorText("Неверный email или пароль.");
      return;
    }

    navigate("/admin");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <div className="w-full rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-300/15 text-cyan-200">
              <Atom className="h-8 w-8" />
            </div>

            <h1 className="text-3xl font-black">Вход в админку</h1>

            <p className="mt-2 text-slate-400">
              Панель управления сайтом учителя
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Email</span>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
                <Mail className="h-5 w-5 text-cyan-200" />

                <input
                  type="email"
                  placeholder="teacher@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent outline-none placeholder:text-slate-600"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Пароль</span>

              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
                <Lock className="h-5 w-5 text-cyan-200" />

                <input
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent outline-none placeholder:text-slate-600"
                  required
                />
              </div>
            </label>

            {errorText && (
              <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                {errorText}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-cyan-300 px-6 py-4 font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Входим..." : "Войти"}
            </button>
          </form>

          <a
            href="/"
            className="mt-6 block text-center text-sm text-slate-400 hover:text-cyan-200"
          >
            Вернуться на сайт
          </a>
        </div>
      </div>
    </main>
  );
}

export default AdminLogin;