import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase.js";
import { api } from "../services/api.js";

/**
 * Mobile equivalent of apps/web/client/src/context/AuthContext.jsx.
 * Deliberately simpler: the web version also handles a browser-only flow
 * (admin panel redirecting into the client site with a token in the URL
 * query string) — there's no equivalent on mobile, so that branch is
 * dropped here. Everything else (Firebase session -> sync with backend ->
 * cache the merged profile) mirrors web, with AsyncStorage replacing
 * localStorage.
 */
const AuthContext = createContext(null);

const STORAGE_KEY = "auth_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored && !cancelled) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      }
    })();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;

      if (!firebaseUser) {
        setUser(null);
        await AsyncStorage.removeItem(STORAGE_KEY);
        setLoading(false);
        return;
      }

      const baseUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
      };

      try {
        // Sync/create the user record in the backend, same as web.
        await api("/api/users/init", {
          auth: true,
          method: "POST",
          body: JSON.stringify({
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          }),
        });

        const profileResponse = await api("/api/users/profile", { auth: true });
        const dbUser = profileResponse?.user || profileResponse?.data || profileResponse;

        const mergedUser = {
          ...baseUser,
          displayName: dbUser?.displayName || baseUser.displayName,
          photoURL: dbUser?.photoURL || baseUser.photoURL,
        };

        setUser(mergedUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedUser));
      } catch {
        // Backend sync failed — still let the user through on the Firebase session.
        setUser(baseUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(baseUser));
      }

      setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const value = { user, loading, logout, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
