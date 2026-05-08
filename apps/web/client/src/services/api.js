import { auth } from "./firebase.js";

// Get API URL from environment variables
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

// Get a valid token only for protected requests.
// Falls back to stored token for users redirected from admin panel.
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
        // Continue to stored token fallback below.
      }
    }

    return localStorage.getItem("auth_token");
  })();

  try {
    return await pendingTokenRequest;
  } finally {
    pendingTokenRequest = null;
  }
};

const getFreshToken = async () => {
  const maxAttempts = 4; // 4 attempts with 500ms delay = 2 seconds total
  let attempt = 0;

  // First, try to get token from Firebase auth
  while (attempt < maxAttempts) {
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        // Always get a fresh token to ensure it's valid
        const token = await currentUser.getIdToken(true);
        return token;
      } catch {
        break; // Break and try stored token
      }
    }

    attempt++;
    // Wait before retrying (gives Firebase time to restore session)
    if (attempt < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Fallback: Check for stored token (used for token redirect from admin panel)
  const storedToken = localStorage.getItem("auth_token");
  if (storedToken) {
    return storedToken;
  }

  return null;
};

export const api = async (endpoint, options = {}) => {
  const {
    auth: requiresAuth = false,
    headers: customHeaders,
    ...fetchOptions
  } = options;
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
    credentials: "include",
  });

  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    if (requiresAuth && res.status === 401 && auth.currentUser) {
      const freshToken = await getFreshToken();
      if (freshToken && freshToken !== token) {
        const retryHeaders = {
          ...headers,
          Authorization: `Bearer ${freshToken}`,
        };
        const retryRes = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...fetchOptions,
          headers: retryHeaders,
          credentials: "include",
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

// ----------------------------
// Auth API calls
// ----------------------------
export const authApi = {
  test: () => api("/api/test"),
  // Note: Firebase handles auth on frontend (Google OAuth, Magic Link)
};

// Listings API calls
export const listingsApi = {
  // GET /api/listings?category=&occasion=&gender=&city=
  getAll: (filters = {}, options = {}) => {
    const params = new URLSearchParams();

    // Handle multiple categories
    if (filters.category && Array.isArray(filters.category)) {
      filters.category.forEach((cat) => params.append("category", cat));
    } else if (filters.category) {
      params.append("category", filters.category);
    }

    // Handle multiple occasions
    if (filters.occasion && Array.isArray(filters.occasion)) {
      filters.occasion.forEach((occ) => params.append("occasion", occ));
    } else if (filters.occasion) {
      params.append("occasion", filters.occasion);
    }

    // Handle multiple genders
    if (filters.gender && Array.isArray(filters.gender)) {
      filters.gender.forEach((gen) => params.append("gender", gen));
    } else if (filters.gender) {
      params.append("gender", filters.gender);
    }

    if (filters.city) params.append("city", filters.city);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.sortBy) params.append("sortBy", filters.sortBy);
    const query = params.toString() ? `?${params.toString()}` : "";
    return api(`/api/listings${query}`, { signal: options.signal });
  },

  // POST /api/listings/:id/view
  trackView: (id) =>
    api(`/api/listings/${id}/view`, {
      method: "POST",
    }),

  // GET /api/listings/:id
  getById: (id, bypassCache = false) => {
    const url = bypassCache
      ? `/api/listings/${id}?bypassCache=true`
      : `/api/listings/${id}`;
    return api(url);
  },

  // POST /api/listings (protected)
  create: (data) =>
    api("/api/listings", {
      auth: true,
      method: "POST",
      body: JSON.stringify(data),
    }),

  // GET /api/listings/user/listings/all (protected)
  getUserListings: () =>
    api("/api/listings/user/listings/all", {
      auth: true,
      method: "GET",
    }),

  // PATCH /api/listings/:id (protected)
  update: (id, data) =>
    api(`/api/listings/${id}`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // DELETE /api/listings/:id (protected)
  delete: (id) =>
    api(`/api/listings/${id}`, {
      auth: true,
      method: "DELETE",
    }),
};

// Category video API calls
export const categoryVideosApi = {
  // GET /api/category-videos
  getAll: () => api("/api/category-videos"),

  // GET /api/category-videos/:category
  getByCategory: (category) =>
    api(`/api/category-videos/${encodeURIComponent(category)}`),

  // POST /api/category-videos (protected)
  create: (data) =>
    api("/api/category-videos", {
      auth: true,
      method: "POST",
      body: JSON.stringify(data),
    }),

  // PATCH /api/category-videos/:id (protected)
  update: (id, data) =>
    api(`/api/category-videos/${id}`, {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // DELETE /api/category-videos/:id (protected)
  delete: (id) =>
    api(`/api/category-videos/${id}`, {
      auth: true,
      method: "DELETE",
    }),
};

// Users API calls
export const usersApi = {
  // POST /api/users/init (protected) - Initialize user in database
  init: (data) =>
    api("/api/users/init", {
      auth: true,
      method: "POST",
      body: JSON.stringify(data),
    }),

  // GET /api/users/profile (protected) - Get user profile
  getProfile: () =>
    api("/api/users/profile", {
      auth: true,
      method: "GET",
    }),

  // PATCH /api/users/profile (protected) - Update user profile
  updateProfile: (data) =>
    api("/api/users/profile", {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  updateDeliveryDetails: (data) =>
    api("/api/users/delivery-details", {
      auth: true,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // DELETE /api/users/account (protected) - Delete user account
  deleteAccount: () =>
    api("/api/users/account", {
      auth: true,
      method: "DELETE",
    }),
};

// Cart API calls
export const cartApi = {
  // GET /api/cart (protected)
  getItems: () =>
    api("/api/cart", {
      auth: true,
      method: "GET",
    }),

  // POST /api/cart (protected)
  addItem: (data) =>
    api("/api/cart", {
      auth: true,
      method: "POST",
      body: JSON.stringify(data),
    }),

  // POST /api/cart/reserve (protected)
  reserveAll: () =>
    api("/api/cart/reserve", {
      auth: true,
      method: "POST",
    }),

  // DELETE /api/cart/:listingId (protected)
  removeItem: (listingId) =>
    api(`/api/cart/${listingId}`, {
      auth: true,
      method: "DELETE",
    }),

  // DELETE /api/cart (protected)
  clear: () =>
    api("/api/cart", {
      auth: true,
      method: "DELETE",
    }),
};

// Payments API calls
export const paymentsApi = {
  // GET /api/payments/renter-bookings (protected) - Get bookings where user is the owner
  getRenterBookings: () =>
    api("/api/payments/renter-bookings", {
      auth: true,
      method: "GET",
    }),

  // GET /api/payments/my-bookings (protected) - Get bookings where user is the renter
  getUserBookings: () =>
    api("/api/payments/my-bookings", {
      auth: true,
      method: "GET",
    }),
};
