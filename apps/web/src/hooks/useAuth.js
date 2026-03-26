import { useState } from 'react'
// TODO: connect to backend /api/auth endpoints

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const sendOtp = async (phone) => {
    setLoading(true)
    // TODO: await api('/auth/send-otp', { method: 'POST', body: JSON.stringify({ phone }) })
    console.log('OTP sent to', phone)
    setLoading(false)
  }

  const verifyOtp = async (phone, otp) => {
    setLoading(true)
    // TODO: const data = await api('/auth/verify-otp', { method: 'POST', ... })
    // TODO: store JWT, set user
    console.log('Verifying OTP for', phone, otp)
    setLoading(false)
  }

  const logout = () => {
    setUser(null)
    // TODO: clear JWT from localStorage
  }

  return { user, loading, sendOtp, verifyOtp, logout }
}