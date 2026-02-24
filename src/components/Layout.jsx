import React from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Main layout with a simple top navigation bar and container.

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight text-white hover:text-emerald-200"
            >
              <span className="text-xl">🔗</span>
              <span>اختصرلى</span>
            </Link>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  "border border-white/10 bg-white/5 hover:bg-white/10",
                  isActive && !isDashboard
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                    : "text-slate-100",
                ].join(" ")
              }
            >
              الرئيسية
            </NavLink>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                [
                  "rounded-full px-4 py-2 text-sm font-semibold transition",
                  "border border-white/10 bg-white/5 hover:bg-white/10",
                  isActive
                    ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                    : "text-slate-100",
                ].join(" ")
              }
            >
              لوحة التحكم
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200">
                👋 مرحباً يا بدر
                </span>
                <button
                  type="button"
                  className="rounded-full border cursor-pointer border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-[0.99]"
                  onClick={logout}
                >
                  تسجيل الخروج
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 bg-slate-950/30 py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-300">
        💖 اختصرلى - أداة شخصية لاختصار الروابط. صُمِّمت خصيصاً لبدر.
        </div>
      </footer>
    </div>
  );
}

