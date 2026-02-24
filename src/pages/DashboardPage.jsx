import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase";

// Dashboard listing all URLs and simple statistics.

const URL_COLLECTION = "urls";

export default function DashboardPage() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, URL_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setUrls(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "حدث خطأ أثناء تحميل الروابط.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const stats = useMemo(() => {
    let totalClicks = 0;
    const countryMap = {};

    urls.forEach((item) => {
      totalClicks += item.clicks || 0;
      if (item.countryStats) {
        Object.entries(item.countryStats).forEach(([country, value]) => {
          countryMap[country] = (countryMap[country] || 0) + (value || 0);
        });
      }
    });

    const topCountries = Object.entries(countryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalUrls: urls.length,
      totalClicks,
      topCountries,
    };
  }, [urls]);

  const handleCopy = async (shortCode) => {
    const shortUrl = `${window.location.origin}/${shortCode}`;
    try {
      await navigator.clipboard.writeText(shortUrl);
      alert("تم نسخ الرابط المختصر إلى الحافظة.");
    } catch {
      alert("تعذر نسخ الرابط. يمكنك نسخه يدوياً.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "هل تريد حذف هذا الرابط المختصر نهائياً؟"
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(collection(db, URL_COLLECTION), id));
    } catch (err) {
      alert(err.message || "حدث خطأ أثناء حذف الرابط.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl">
          لوحة التحكم
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-300 md:text-base">
          راقب كل الروابط المختصرة، عدد الضغطات، وأهم الدول التى تأتى منها
          الزيارات.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
          <p className="text-sm font-semibold text-slate-300">إجمالى الروابط</p>
          <p className="mt-2 text-3xl font-extrabold text-white">
            {stats.totalUrls}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
          <p className="text-sm font-semibold text-slate-300">إجمالى الضغطات</p>
          <p className="mt-2 text-3xl font-extrabold text-white">
            {stats.totalClicks}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/10 backdrop-blur-xl">
          <p className="text-sm font-semibold text-slate-300">أهم الدول</p>
          {stats.topCountries.length === 0 ? (
            <p className="mt-2 text-xs text-slate-400">
              لم يتم تسجيل دول بعد. ستظهر تلقائياً مع الزيارات الجديدة.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {stats.topCountries.map(([country, count]) => (
                <li
                  key={country}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/20 px-3 py-2"
                >
                  <span className="text-slate-100">{country}</span>
                  <span className="font-mono text-emerald-200">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-extrabold text-white">كل الروابط المختصرة</h2>
          <p className="text-sm text-slate-300">
            نسخ سريع، حذف آمن، وروابط واضحة.
          </p>
        </div>

        <div className="mt-5 space-y-3">
          {loading && <p className="text-sm text-slate-300">جارى تحميل الروابط...</p>}

          {error && (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}

          {!loading && urls.length === 0 && (
            <p className="text-sm text-slate-300">
              لم تقم بإنشاء أى روابط حتى الآن. ابدأ من صفحة الرئيسية.
            </p>
          )}

          {!loading && urls.length > 0 && (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-950/40">
                  <tr className="text-right text-slate-200">
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">
                      الرابط الأصلى
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">
                      الرابط المختصر
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">
                      الضغطات
                    </th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {urls.map((item) => {
                    const shortUrl = `${window.location.origin}/${item.shortCode}`;
                    return (
                      <tr key={item.id} className="hover:bg-white/5">
                        <td className="px-4 py-3">
                          <a
                            href={item.originalUrl}
                            target="_blank"
                            rel="noreferrer"
                            dir="ltr"
                            className="block break-all font-mono text-xs text-sky-200 hover:text-sky-100"
                          >
                            {item.originalUrl}
                          </a>
                        </td>
                        <td className="px-4 py-3">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            dir="ltr"
                            className="block break-all font-mono text-xs text-emerald-200 hover:text-emerald-100"
                          >
                            {shortUrl}
                          </a>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-100">
                          {item.clicks || 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="rounded-xl border cursor-pointer border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/10 active:scale-[0.99]"
                              onClick={() => handleCopy(item.shortCode)}
                            >
                              نسخ
                            </button>
                            <button
                              type="button"
                              className="rounded-xl bg-linear-to-l cursor-pointer from-rose-500 to-red-500 px-3 py-2 text-xs font-extrabold text-slate-950 transition hover:brightness-110 active:scale-[0.99]"
                              onClick={() => handleDelete(item.id)}
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

