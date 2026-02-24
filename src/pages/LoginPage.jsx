import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Login screen restricted to the single admin user (Bader).

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!username || !password) {
      setError("من فضلك ادخل اسم المستخدم وكلمة المرور.");
      return;
    }

    try {
      setSubmitting(true);
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="mb-6">
          <div className="mb-3 inline-flex items-center text-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-200">
            <span className="text-base">🔒</span>
            {/* <span>دخول المدير فقط</span> */}
          <h1 className="text-2xl font-extrabold tracking-tight text-white text-center">
            تسجيل الدخول
          </h1>
          </div>
          {/* <p className="mt-2 text-sm text-slate-300">
           مرحبا بك فى  <b>اختصرلى</b>.
          </p> */}
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-slate-200">اسم المستخدم</span>
            <input
              type="text"
              className="w-full rounded-2xl mt-3 border border-white/10 bg-slate-950/30 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20"
              placeholder="Bader"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-slate-200">كلمة المرور</span>
            <input
              type="password"
              className="w-full mt-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-3 text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>

          {error && (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-linear-to-l from-emerald-500 to-teal-400 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "جارى تسجيل الدخول..." : "تسجيل الدخول"}
          </button>
        </form>
      </div>
    </div>
  );
}

