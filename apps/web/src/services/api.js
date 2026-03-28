import { auth } from "./firebase.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ----------------------------
// Core fetch wrapper
// ----------------------------
export const api = async (endpoint, options = {}) => {
  let token = localStorage.getItem("auth_token");

  // If no token in localStorage, try to get from Firebase
  if (!token) {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        token = await currentUser.getIdToken();
      }
    } catch (err) {
      console.error("Error getting Firebase token:", err);
    }
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

// ----------------------------
// Auth API calls
// ----------------------------
export const authApi = {
  test: () => api("/api/test"),
  // Note: Firebase handles auth on frontend (Google OAuth, Magic Link)
  // No backend auth endpoints needed for MVP
};

// ----------------------------
// Listings API calls
// ----------------------------
export const listingsApi = {
  // GET /api/listings?category=&occasion=&city=
  getAll: (filters = {}) => {
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
    
    if (filters.city) params.append("city", filters.city);
    const query = params.toString() ? `?${params.toString()}` : "";
    return api(`/api/listings${query}`);
  },

  // GET /api/listings/:id
  getById: (id) => api(`/api/listings/${id}`),

  // POST /api/listings (protected)
  create: (data) =>
    api("/api/listings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // GET /api/listings/user/listings/all (protected)
  getUserListings: () =>
    api("/api/listings/user/listings/all", {
      method: "GET",
    }),

  // PATCH /api/listings/:id (protected)
  update: (id, data) =>
    api(`/api/listings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // DELETE /api/listings/:id (protected)
  delete: (id) =>
    api(`/api/listings/${id}`, {
      method: "DELETE",
    }),
};