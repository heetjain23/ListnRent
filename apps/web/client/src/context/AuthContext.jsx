import React, { createContext, useState, useEffect } from "react";
import { subscribeToAuthChanges, firebaseSignOut } from "../services/firebase";
import { usersApi } from "../services/api";

export const AuthContext = createContext(null);

// Get API URL from environment
const API_BASE_URL = (() => {
  const env = import.meta.env.VITE_API_URL || import.meta.env.VITE_SERVER_URL;

  if (env) {
    return env.endsWith("/") ? env.slice(0, -1) : env;
  }

  // Development fallback
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:5000";
  }

  // Production: use same origin
  return window.location.origin;
})();

/**
 * AuthProvider - Manages global auth state
 * Must wrap the entire app
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionRestored, setSessionRestored] = useState(false);

  useEffect(() => {
    let unsubscribe;
    let sessionRestoreTimeout;

    const initializeAuth = async () => {
      // First, try to restore user from localStorage (for page refresh persistence)
      const storedUser = localStorage.getItem("auth_user");
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (err) {
          localStorage.removeItem("auth_user");
        }
      }

      // Check if redirected from admin panel with token in URL
      const searchParams = new URLSearchParams(window.location.search);
      const redirectedToken = searchParams.get("token");
      const isRedirected = searchParams.get("redirected") === "true";

      if (isRedirected && redirectedToken) {
        // Store token temporarily for API calls
        localStorage.setItem("auth_token", redirectedToken);

        try {
          // Call user init endpoint with the token
          const response = await fetch(`${API_BASE_URL}/api/users/init`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${redirectedToken}`,
            },
            body: JSON.stringify({
              displayName:
                new URLSearchParams(window.location.search).get(
                  "displayName",
                ) || "",
              photoURL:
                new URLSearchParams(window.location.search).get("photoURL") ||
                "",
            }),
            credentials: "include",
          });

          if (response.ok) {
            // Fetch user profile
            const profileResponse = await fetch(
              `${API_BASE_URL}/api/users/profile`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${redirectedToken}`,
                },
                credentials: "include",
              },
            );

            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              const dbUser =
                profileData.user || profileData.data || profileData;

              const userData = {
                uid: dbUser.uid,
                email: dbUser.email,
                displayName: dbUser.displayName,
                photoURL: dbUser.photoURL,
                provider: "token-redirect",
              };

              setUser(userData);
              localStorage.setItem("auth_user", JSON.stringify(userData));

              // Clean up URL params after successful login
              setTimeout(() => {
                window.history.replaceState(
                  {},
                  document.title,
                  window.location.pathname,
                );
              }, 500);

              setLoading(false);
              return;
            }
          }
        } catch (error) {
          localStorage.removeItem('auth_token')
          // Continue to normal Firebase auth flow
        }
      }

      // Normal Firebase session restoration (for non-redirected users or if redirect fails)
      await new Promise((resolve) => {
        sessionRestoreTimeout = setTimeout(resolve, 1000);
      });

      setSessionRestored(true);

      // Subscribe to Firebase auth state changes
      unsubscribe = subscribeToAuthChanges(async (authUser) => {
        if (authUser) {
          // Don't store the token here - let the api() function handle fresh token retrieval
          // This ensures we always have a valid, non-expired token for API calls

          try {
            // Initialize user in database if they just logged in
            // The api() function will get a fresh token automatically
            await usersApi.init({
              displayName: authUser.displayName,
              photoURL: authUser.photoURL,
            });

            // Fetch the complete user profile from backend to get saved displayName
            try {
              const response = await usersApi.getProfile();
              // Extract user from response (could be response.user or response directly)
              const dbUser = response.user || response.data || response;

              // Only use database displayName if it exists and is different from Firebase one
              // This ensures we always use the most recently saved name in the database
              if (dbUser && dbUser.displayName) {
                const mergedUser = {
                  ...authUser,
                  displayName: dbUser.displayName,
                  photoURL: dbUser.photoURL || authUser.photoURL,
                };

                setUser(mergedUser);

                // Persist merged user info to localStorage
                localStorage.setItem(
                  "auth_user",
                  JSON.stringify({
                    uid: mergedUser.uid,
                    email: mergedUser.email,
                    displayName: mergedUser.displayName,
                    photoURL: mergedUser.photoURL,
                  }),
                );
              } else {
                // Fallback if database displayName is empty
                setUser(authUser);
                localStorage.setItem(
                  "auth_user",
                  JSON.stringify({
                    uid: authUser.uid,
                    email: authUser.email,
                    displayName: authUser.displayName,
                    photoURL: authUser.photoURL,
                  }),
                );
              }
            } catch (err) {
              // If profile fetch fails, use Firebase user but still store it

              setUser(authUser);
              localStorage.setItem(
                "auth_user",
                JSON.stringify({
                  uid: authUser.uid,
                  email: authUser.email,
                  displayName: authUser.displayName,
                  photoURL: authUser.photoURL,
                }),
              );
            }
          } catch (error) {
            // Don't fail the whole auth flow if init fails

            setUser(authUser);
            localStorage.setItem(
              "auth_user",
              JSON.stringify({
                uid: authUser.uid,
                email: authUser.email,
                displayName: authUser.displayName,
                photoURL: authUser.photoURL,
              }),
            );
          }
        } else {
          // Only clear user if there's no stored token (not a redirected user)
          const storedToken = localStorage.getItem("auth_token");
          if (!storedToken) {
            setUser(null);
            localStorage.removeItem("auth_user");
          }
          // If there IS a stored token, keep the user from localStorage (redirected user)
        }

        setLoading(false);
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (sessionRestoreTimeout) {
        clearTimeout(sessionRestoreTimeout);
      }
    };
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
