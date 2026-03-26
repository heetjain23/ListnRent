const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ----------------------------
// Core fetch wrapper
// ----------------------------
export const api = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

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
  // Test
  test: () => api("/api/test"),

  // Phone OTP
  sendPhoneOtp: (phone) =>
    api("/api/auth/phone/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  verifyPhoneOtp: (phone, otp) =>
    api("/api/auth/phone/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),

  // Email OTP
  sendEmailOtp: (email) =>
    api("/api/auth/email/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyEmailOtp: (email, otp) =>
    api("/api/auth/email/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),

  // Google Login (mock)
  googleLogin: (email, name, googleId) =>
    api("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ email, name, googleId }),
    }),
};