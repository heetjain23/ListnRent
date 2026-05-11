import { useState, useCallback } from 'react'
import * as messagesService from '../services/messagesService.js'
import { useSocketContext } from '../context/SocketContext.jsx'

const waitForConnectedSocket = (socketRef, timeoutMs = 8000) => {
  const socket = socketRef.current
  if (!socket) {
    return Promise.reject(new Error('Realtime connection is initializing'))
  }
  if (socket.connected) return Promise.resolve(socket)

  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      cleanup()
      reject(new Error('Realtime connection timed out'))
    }, timeoutMs)

    const cleanup = () => {
      clearTimeout(timeoutId)
      socket.off('connect', handleConnect)
      socket.off('connect_error', handleConnectError)
      socket.off('disconnect', handleDisconnect)
    }

    const handleConnect = () => {
      cleanup()
      resolve(socket)
    }

    const handleConnectError = (err) => {
      cleanup()
      reject(new Error(err?.message || 'Realtime connection failed'))
    }

    const handleDisconnect = (reason) => {
      if (reason === 'io client disconnect') return
      cleanup()
      reject(new Error('Realtime connection disconnected'))
    }

    socket.once('connect', handleConnect)
    socket.once('connect_error', handleConnectError)
    socket.once('disconnect', handleDisconnect)

    if (!socket.active) socket.connect()
  })
}

// ── useConversation ───────────────────────────────────────────────────────────

export const useConversation = (conversationId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]       = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError]           = useState(null)
  const [hasMore, setHasMore]       = useState(true)

  const fetchMessages = useCallback(
    async (limit = 50, skip = 0, silent = false) => {
      if (!conversationId) return
      if (!silent && skip === 0) setLoading(true)
      if (!silent && skip > 0) setLoadingMore(true)
      setError(null)
      try {
        const response = await messagesService.getMessages(conversationId, limit, skip)

        if (skip === 0) {
          setMessages(response.messages || [])
        } else {
          setMessages((prev) => {
            const prevIds = new Set(prev.map((m) => m._id))
            const incoming = (response.messages || []).filter((m) => !prevIds.has(m._id))
            return [...incoming, ...prev]
          })
        }

        setHasMore((response.messages || []).length === limit)
      } catch (err) {
        if (!silent) {
          setError(err.message || 'Failed to fetch messages')
          console.error('Error fetching messages:', err)
        }
      } finally {
        if (!silent && skip === 0) setLoading(false)
        if (!silent && skip > 0) setLoadingMore(false)
      }
    },
    [conversationId]
  )

  /**
   * addMessage — deduplicates by _id so optimistic adds + socket delivers
   * don't produce duplicate bubbles.
   */
  const addMessage = useCallback((message) => {
    setMessages((prev) => {
      if (
        prev.some(
          (m) =>
            m._id === message._id ||
            (message.clientRequestId && m.clientRequestId === message.clientRequestId)
        )
      ) return prev
      return [...prev, message]
    })
  }, [])

  const replaceMessage = useCallback((tempId, message) => {
    setMessages((prev) => {
      const idx = prev.findIndex(
        (m) =>
          m._id === tempId ||
          m._id === message._id ||
          (message.clientRequestId && m.clientRequestId === message.clientRequestId)
      )
      if (idx < 0) return [...prev, message]
      const next = [...prev]
      next[idx] = { ...message }
      return next
    })
  }, [])

  const updateMessage = useCallback((messageId, patch) => {
    setMessages((prev) =>
      prev.map((message) =>
        message._id === messageId ? { ...message, ...patch } : message
      )
    )
  }, [])

  return {
    messages,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchMessages,
    addMessage,
    replaceMessage,
    updateMessage,
  }
}

// ── useConversations ──────────────────────────────────────────────────────────

export const useConversations = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [hasMore, setHasMore]             = useState(true)

  const fetchConversations = useCallback(async (limit = 20, skip = 0) => {
    setLoading(true)
    setError(null)
    try {
      const response = await messagesService.getConversations(limit, skip)
      const data     = response.conversations || response || []
      const arr      = Array.isArray(data) ? data : []

      if (skip === 0) {
        setConversations(arr)
      } else {
        setConversations((prev) => [...prev, ...arr])
      }
      setHasMore(arr.length === limit)
    } catch (err) {
      setError(err.message || 'Failed to fetch conversations')
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * addOrUpdateConversation — upserts a conversation and moves it to the top.
   * Called by the socket `conversation:update` handler in ChatWindow.
   */
  const addOrUpdateConversation = useCallback((incoming) => {
    setConversations((prev) => {
      const idx = prev.findIndex(
        (c) => c._id === incoming._id || c._id === incoming.conversationId
      )

      if (idx >= 0) {
        // Merge update fields into the existing conversation
        const updated = [...prev]
        updated[idx] = { ...updated[idx], ...incoming }
        // Move to top (latest message)
        const [item] = updated.splice(idx, 1)
        return [item, ...updated]
      }

      // Brand-new conversation — prepend
      return [incoming, ...prev]
    })
  }, [])

  return {
    conversations,
    loading,
    error,
    hasMore,
    fetchConversations,
    addOrUpdateConversation,
  }
}

// ── useSendMessage ────────────────────────────────────────────────────────────

/**
 * sendMessage(conversationId, text)
 *
 * Always uses an existing conversationId. The conversation is guaranteed to
 * exist because the user selected it from the list (or it was just created
 * via getOrCreateConversation before the chat opened).
 *
 * The old (listingId, recipientId, text) signature caused a 400 because
 * the controller couldn't find a conversationId and the fallback fields
 * were also misnamed (recipientId vs otherUserId).
 */
export const useSendMessage = () => {
  const { socketRef, connected } = useSocketContext()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const sendMessage = useCallback(async (conversationId, text, clientRequestId) => {
    if (!conversationId || !text?.trim()) {
      throw new Error('conversationId and text are required')
    }
    setLoading(true)
    setError(null)
    try {
      const socket = await waitForConnectedSocket(socketRef)
      return await new Promise((resolve, reject) => {
        socket.timeout(10000).emit(
          'new_message',
          { conversationId, text, clientRequestId },
          (err, response) => {
            if (err) {
              reject(new Error('Message send timed out'))
              return
            }
            if (!response?.success) {
              reject(new Error(response?.message || 'Failed to send message'))
              return
            }
            resolve(response)
          }
        )
      })
    } catch (err) {
      const msg = err.message || 'Failed to send message'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [socketRef])

  return { sendMessage, loading, error, connected }
}

// ── useGetOrCreateConversation ────────────────────────────────────────────────

export const useGetOrCreateConversation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const getOrCreate = useCallback(async (listingId, otherUserId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await messagesService.getOrCreateConversation(listingId, otherUserId)
      return response
    } catch (err) {
      const msg = err.message || 'Failed to get/create conversation'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { getOrCreate, loading, error }
}

// ── useUnreadCount ────────────────────────────────────────────────────────────

export const useUnreadCount = () => {
  return {
    unreadCount: 0,
    unreadConversations: [],
    loading: false,
    fetchUnreadCount: () => {},
  }
}
