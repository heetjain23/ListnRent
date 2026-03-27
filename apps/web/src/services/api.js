const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ----------------------------
// Core fetch wrapper
// ----------------------------
export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem("auth_token");

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
    if (filters.category) params.append("category", filters.category);
    if (filters.occasion) params.append("occasion", filters.occasion);
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
};