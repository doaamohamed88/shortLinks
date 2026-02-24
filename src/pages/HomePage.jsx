import React, { useState } from "react";
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// Home page where the admin can create short URLs.

const URL_COLLECTION = "urls";

// Helper to generate a random short code when the admin
// does not provide a custom alias.
function generateRandomCode(length = 6) {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"; // avoid similar-looking chars
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export default function HomePage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [creating, setCreating] = useState(false);
  const [successLink, setSuccessLink] = useState("");
  const [error, setError] = useState("");

  // Normalise and basic-check the URL before saving.
  const normaliseUrl = (url) => {
    if (!url) return "";
    // Add protocol if the user forgot it.
    if (!/^https?:\/\//i.test(url)) {
      return `https://${url}`;
    }
    return url;
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessLink("");

    const trimmedUrl = originalUrl.trim();
    if (!trimmedUrl) {
      setError("من فضلك أدخل الرابط الأصلى أولاً.");
      return;
    }

    let shortCode = customAlias.trim();
    if (shortCode) {
      // Only allow simple, URL-safe characters for custom aliases.
      const valid = /^[a-zA-Z0-9_-]+$/.test(shortCode);
      if (!valid) {
        setError(
          "يمكن أن يحتوى الاسم المخصص على حروف وأرقام و- و_. فقط."
        );
        return;
      }
    }

    try {
      setCreating(true);

      // Resolve the final short code (custom alias or generated).
      if (!shortCode) {
        // Try a few times to avoid collisions.
        for (let i = 0; i < 5; i += 1) {
          const candidate = generateRandomCode();
          const candidateRef = doc(collection(db, URL_COLLECTION), candidate);
          const snapshot = await getDoc(candidateRef);
          if (!snapshot.exists()) {
            shortCode = candidate;
            break;
          }
        }

        if (!shortCode) {
          throw new Error("تعذر إنشاء كود قصير فريد. حاول مرة أخرى.");
        }
      } else {
        // Ensure the custom alias is not already used.
        const aliasRef = doc(collection(db, URL_COLLECTION), shortCode);
        const aliasDoc = await getDoc(aliasRef);
        if (aliasDoc.exists()) {
          throw new Error("هذا الاسم المخصص مستخدم بالفعل. اختر اسماً آخر.");
        }
      }

      const normalised = normaliseUrl(trimmedUrl);

      const docRef = doc(collection(db, URL_COLLECTION), shortCode);
      await setDoc(docRef, {
        originalUrl: normalised,
        shortCode,
        clicks: 0,
        createdAt: serverTimestamp(),
        // Country stats will be stored as a map: { "Saudi Arabia": 10, ... }
        countryStats: {},
      });

      const baseUrl = window.location.origin;
      const fullShortUrl = `${baseUrl}/${shortCode}`;
      setSuccessLink(fullShortUrl);
      setOriginalUrl("");
      setCustomAlias("");
    } catch (err) {
      // Show a friendly Arabic message when possible.
      setError(err.message || "حدث خطأ أثناء إنشاء الرابط المختصر.");
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (!successLink) return;
    try {
      await navigator.clipboard.writeText(successLink);
      alert("تم نسخ الرابط المختصر إلى الحافظة.");
    } catch {
      alert("تعذر نسخ الرابط. يمكنك نسخه يدوياً.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
          <span className="text-sm">⚡</span>
          <span>اختصار سريع</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          اختصر روابطك الشخصية فى ثوانى
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
          يلا شوت يلا لايف  قص الروابط — كل اللينكات الطويلة تتحول لرابط
          واحد قصير أنيق تقدر تشاركه فى أى مكان.
        </p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <form className="space-y-5" onSubmit={handleCreate}>
          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-slate-200">الرابط الأصلى</span>
            <input
              type="url"
              dir="ltr"
              className="w-full mt-3 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 font-mono text-[0.95rem] text-white placeholder:font-sans placeholder:text-slate-500 outline-none transition focus:border-emerald-400/40 focus:ring-2 focus:ring-emerald-400/20"
              placeholder="https://example.com/very/long/link"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
            />
          </label>

          <label className="block space-y-2 text-sm">
            <span className="font-semibold text-slate-200 mb-3 block">
              اسم مخصص (اختيارى)
            </span>
            <div
              className="flex items-stretch overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30 focus-within:border-emerald-400/40 focus-within:ring-2 focus-within:ring-emerald-400/20"
              dir="ltr"
            >
              <span className="inline-flex items-center border-r border-white/10 px-3 text-xs text-slate-300">
                {window.location.origin}/
              </span>
              <input
                type="text"
                className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none"
                placeholder="bader-link أو اتركه فارغاً"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-400">
              مسموح: حروف/أرقام و <span dir="ltr">- _</span>
            </p>
          </label>

          {error && (
            <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full cursor-pointer rounded-2xl bg-linear-to-l from-emerald-500 to-teal-400 px-4 py-4 text-base font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
            disabled={creating}
          >
            {creating ? "جارى الاختصار..." : "اختصر اللينك"}
          </button>
        </form>

        {successLink && (
          <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-5">
            <h2 className="text-base font-extrabold text-white">
              تم إنشاء الرابط بنجاح 🎉
            </h2>
            <p className="mt-2 break-all font-mono text-sm text-emerald-200">
              <a href={successLink} target="_blank" rel="noreferrer">
                {successLink}
              </a>
            </p>
            <button
              type="button"
              className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 active:scale-[0.99]"
              onClick={handleCopy}
            >
              نسخ الرابط المختصر
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

