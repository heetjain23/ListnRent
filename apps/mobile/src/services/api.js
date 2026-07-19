import { NativeModules, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./firebase.js";

const API_PORT = "5000";

const getExpoDevServerHost = () => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.hostname;
  }

  const scriptUrl = NativeModules.SourceCode?.scriptURL;
  const hostMatch = scriptUrl?.match(/^(?:https?|exp):\/\/([^/:]+)/);
  return hostMatch?.[1] || null;
};

const resolveDevFallback = () => {
  const devServerHost = getExpoDevServerHost();

  if (devServerHost && devServerHost !== "localhost" && devServerHost !== "127.0.0.1") {
    return `http://${devServerHost}:${API_PORT}`;
  }

  if (Platform.OS === "android") return `http://10.0.2.2:${API_PORT}`;
  return `http://localhost:${API_PORT}`;
};

const rawUrl = process.env.EXPO_PUBLIC_API_URL || resolveDevFallback();
export const API_BASE_URL = rawUrl.endsWith("/") ? rawUrl.slice(0, -1) : rawUrl;

let pendingTokenRequest = null;

const waitForFirebaseUser = async (maxAttempts = 4) => {
  let attempt = 0;
  while (attempt < maxAttempts) {
    if (auth.currentUser) return auth.currentUser;
    attempt++;
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  return null;
};

const getValidToken = async () => {
  if (pendingTokenRequest) return pendingTokenRequest;

  pendingTokenRequest = (async () => {
    const currentUser = await waitForFirebaseUser();

    if (currentUser) {
      try {
        return await currentUser.getIdToken(false);
      } catch {
        // fall through to stored token
      }
    }

    return AsyncStorage.getItem("auth_token");
  })();

  try {
    return await pendingTokenRequest;
  } finally {
    pendingTokenRequest = null;
  }
};

const getFreshToken = async () => {
  const maxAttempts = 4;
  let attempt = 0;

  while (attempt < maxAttempts) {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        return await currentUser.getIdToken(true);
      } catch {
        break;
      }
    }
    attempt++;
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return AsyncStorage.getItem("auth_token");
};

export const api = async (endpoint, options = {}) => {
  const { auth: requiresAuth = false, headers: customHeaders, ...fetchOptions } = options;
  let token = null;

  if (requiresAuth) {
    token = await getValidToken();
  }

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...customHeaders,
  };

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    if (requiresAuth && res.status === 401 && auth.currentUser) {
      const freshToken = await getFreshToken();
      if (freshToken && freshToken !== token) {
        const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...fetchOptions,
          headers: { ...headers, Authorization: `Bearer ${freshToken}` },
        });
        const retryContentType = retryRes.headers.get("content-type") || "";
        const retryData = retryContentType.includes("application/json")
          ? await retryRes.json()
          : null;

        if (!retryRes.ok) {
          throw new Error(retryData?.message || "Something went wrong");
        }
        return retryData;
      }
    }
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
};