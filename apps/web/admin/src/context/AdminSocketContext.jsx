import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { auth } from '../services/firebase'
import { useAdminAuth } from '../hooks/useAdminAuth'

const AdminSocketContext = createContext(null)

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:5000'

const STAFF_ROLES = new Set(['support_team', 'admin', 'super_admin'])

export const AdminSocketProvider = ({ children }) => {
  const { admin } = useAdminAuth()
  const adminRef = useRef(admin)
  const socketRef = useRef(null)

  const [connected, setConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('idle')
  const [connectionError, setConnectionError] = useState(null)
  const [connectCount, setConnectCount] = useState(0)

  useEffect(() => {
    adminRef.current = admin
  }, [admin])

  const getToken = useCallback(async () => {
    try {
      if (auth.currentUser?.getIdToken) {
        return await auth.currentUser.getIdToken(false)
      }
      return null
    } catch {
      return null
    }
  }, [])

  useEffect(() => {
    if (!admin?.uid) {
      const resetTimer = window.setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.disconnect()
          socketRef.current = null
        }
        setConnected(false)
        setConnectionStatus('idle')
        setConnectionError(null)
        setConnectCount(0)
      }, 0)

      return () => window.clearTimeout(resetTimer)
    }

    if (socketRef.current) return

    let cancelled = false

    const initSocket = async () => {
      setConnectionStatus('connecting')
      setConnectionError(null)

      const token = await getToken()
      if (!token || cancelled) {
        if (!cancelled) {
          setConnectionStatus('error')
          setConnectionError('No auth token available for realtime connection')
        }
        return
      }

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 20,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 15000,
        randomizationFactor: 0.3,
        timeout: 20000,
        autoConnect: false,
      })

      socket.on('connect', () => {
        if (cancelled) return

        setConnected(true)
        setConnectionStatus('connected')
        setConnectionError(null)
        setConnectCount((value) => value + 1)

        const role = adminRef.current?.role
        if (role && STAFF_ROLES.has(role)) {
          socket.emit('join:staff_disputes')
        }
      })

      socket.on('disconnect', () => {
        if (cancelled) return
        setConnected(false)
        setConnectionStatus('reconnecting')
      })

      socket.on('connect_error', async (err) => {
        if (cancelled) return

        setConnected(false)
        setConnectionStatus('error')
        setConnectionError(err?.message || 'Realtime connection failed')

        if (
          err?.message?.includes('Authentication') ||
          err?.message?.includes('Invalid') ||
          err?.message?.includes('token')
        ) {
          const freshToken = await getToken()
          if (freshToken && !cancelled) {
            socket.auth = { token: freshToken }
          }
        }
      })

      socketRef.current = socket
      socket.connect()
    }

    initSocket()

    return () => {
      cancelled = true
      const teardownTimer = window.setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.disconnect()
          socketRef.current = null
        }
        setConnected(false)
        setConnectionStatus('idle')
        setConnectionError(null)
        setConnectCount(0)
      }, 0)
    }
  }, [admin?.uid, getToken])

  useEffect(() => {
    if (!admin?.uid) return undefined

    const id = setInterval(async () => {
      const token = await getToken()
      if (token && socketRef.current) {
        socketRef.current.auth = { token }
        socketRef.current.disconnect().connect()
      }
    }, 55 * 60 * 1000)

    return () => clearInterval(id)
  }, [admin?.uid, getToken])

  const value = {
    socketRef,
    connected,
    connectionStatus,
    connectionError,
    connectCount,
    getSocket: () => socketRef.current,
  }

  return <AdminSocketContext.Provider value={value}>{children}</AdminSocketContext.Provider>
}

export const useAdminSocketContext = () => {
  const context = useContext(AdminSocketContext)
  if (!context) {
    throw new Error('useAdminSocketContext must be used within AdminSocketProvider')
  }
  return context
}
