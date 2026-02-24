import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

// Public redirect page:
// 1. Looks up the short code in Firestore.
// 2. Optionally calls a GeoIP service to detect the visitor country.
// 3. Increments click count and country statistics.
// 4. Redirects the user to the original URL.

const URL_COLLECTION = "urls";

export default function RedirectPage() {
  const { shortCode } = useParams();
  const [status, setStatus] = useState("loading"); // loading | not-found | error
  const [message, setMessage] = useState("");
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // React StrictMode in development intentionally runs effects twice.
    // This guard prevents double-incrementing clicks for a single visit.
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;

    const performRedirect = async () => {
      if (!shortCode) {
        setStatus("not-found");
        setMessage("لم يتم العثور على هذا الرابط المختصر.");
        return;
      }

      try {
        const docRef = doc(collection(db, URL_COLLECTION), shortCode);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          setStatus("not-found");
          setMessage("هذا الرابط المختصر غير موجود أو تم حذفه.");
          return;
        }

        const data = snapshot.data();
        let countryName = "غير معروف";

        try {
          // You can change this endpoint or add an API key via env vars.
          const response = await fetch("https://ipapi.co/json/");
          if (response.ok) {
            const json = await response.json();
            if (json && json.country_name) {
              countryName = json.country_name;
            }
          }
        } catch {
          // If GeoIP fails, we simply skip country tracking.
        }

        const countryKey = `countryStats.${countryName}`;

        await updateDoc(docRef, {
          clicks: increment(1),
          [countryKey]: increment(1),
        });

        // Finally redirect to the original URL.
        window.location.replace(data.originalUrl);
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "حدث خطأ غير متوقع أثناء إعادة التوجيه.");
      }
    };

    performRedirect();
  }, [shortCode]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-emerald-400" />
        <p className="text-sm text-slate-300">
          جارى تجهيز الرابط وإعادة التوجيه...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          الرابط غير متاح
        </h1>
        <p className="mt-2 text-sm text-slate-300">
        {message ||
          "هذا الرابط غير متاح حالياً. يمكنك الرجوع للرئيسية وإنشاء رابط جديد."}
        </p>
      </div>
    </div>
  );
}

