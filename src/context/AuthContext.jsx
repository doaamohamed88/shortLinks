import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebase";

// Simple authentication context to share the current user
// and login / logout functions across the app.

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Read the admin email value from environment variables.
  // This is the only Firebase user allowed to log in.
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    // Subscribe to Firebase auth state changes.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && adminEmail && currentUser.email !== adminEmail) {
        // If someone else somehow signs in, force sign out.
        signOut(auth);
        setUser(null);
      } else {
        setUser(currentUser);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [adminEmail]);

  // Login handler that enforces the "Bader" username restriction
  // on top of Firebase email / password authentication.
  const login = async ({ username, password }) => {
    if (!adminEmail) {
      throw new Error(
        "لم يتم ضبط بريد المدير فى المتغيرات البيئية VITE_ADMIN_EMAIL."
      );
    }

    if (username.trim() !== "Bader") {
      throw new Error("اسم المستخدم غير صحيح. يسمح للمدير بدر فقط بالدخول.");
    }

    // Password is checked by Firebase. Make sure the Firebase user
    // has the same password you expect (مثل: Bader518).
    const credential = await signInWithEmailAndPassword(
      auth,
      adminEmail,
      password
    );

    // Extra safety: ensure the logged-in email is still the admin email.
    if (!credential.user || credential.user.email !== adminEmail) {
      await signOut(auth);
      throw new Error("حساب غير مُصرح له.");
    }

    setUser(credential.user);
    return credential.user;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = {
    user,
    authLoading,
    login,
    logout,
    isAdmin: !!user && !!adminEmail && user.email === adminEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

