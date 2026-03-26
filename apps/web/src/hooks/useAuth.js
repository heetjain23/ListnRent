import { useState, useEffect } from "react";
import { authApi } from "../services/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const clearError = () => setError(null);

  // Phone OTP
  const sendPhoneOtp = async (phone) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.sendPhoneOtp(phone);
      console.log("[Auth] OTP sent:", res);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPhoneOtp = async (phone, otp) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.verifyPhoneOtp(phone, otp);
      _handleAuthSuccess(res.data);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Email OTP
  const sendEmailOtp = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.sendEmailOtp(email);
      console.log("[Auth] OTP sent:", res);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailOtp = async (email, otp) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.verifyEmailOtp(email, otp);
      _handleAuthSuccess(res.data);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Google Login (mock)
  const googleLogin = async (email, name, googleId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.googleLogin(email, name, googleId);
      _handleAuthSuccess(res.data);
      return res;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // Internal: save token + user
  const _handleAuthSuccess = ({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  return {
    user,
    loading,
    error,
    clearError,
    sendPhoneOtp,
    verifyPhoneOtp,
    sendEmailOtp,
    verifyEmailOtp,
    googleLogin,
    logout,
    isLoggedIn: !!user,
  };
};