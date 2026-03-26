const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return res.json();
};