import { api } from "./api.js";

export const listingsApi = {
  // GET /api/listings?category=&occasion=&gender=&city=&limit=&sortBy=
  getAll: (filters = {}, options = {}) => {
    const params = new URLSearchParams();

    if (filters.category && Array.isArray(filters.category)) {
      filters.category.forEach((cat) => params.append("category", cat));
    } else if (filters.category) {
      params.append("category", filters.category);
    }

    if (filters.occasion && Array.isArray(filters.occasion)) {
      filters.occasion.forEach((occ) => params.append("occasion", occ));
    } else if (filters.occasion) {
      params.append("occasion", filters.occasion);
    }

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
};