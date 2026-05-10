import { useState, useCallback } from 'react'
import * as messagesService from '../services/messagesService.js'

// ── useConversation ───────────────────────────────────────────────────────────

export const useConversation = (conversationId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [hasMore, setHasMore]   = useState(true)

  const fetchMessages = useCallback(
    async (limit = 50, skip = 0, silent = false) => {
      if (!conversationId) return
      if (!silent) setLoading(true)
      setError(null)
      try {
        const response = await messagesService.getMessages(conversationId, limit, skip)

        if (silent && skip === 0) {
          // Background refresh: only append genuinely new messages
          setMessages((prev) => {
            const prevIds = new Set(prev.map((m) => m._id))
            const incoming = (response.messages || []).filter((m) => !prevIds.has(m._id))
            return incoming.length ? [...prev, ...incoming] : prev
          })
        } else if (skip === 0) {
          setMessages(response.messages || [])
        } else {
          setMessages((prev) => [...(response.messages || []), ...prev])
        }

        setHasMore((response.messages || []).length === limit)
      } catch (err) {
        if (!silent) {
          setError(err.message || 'Failed to fetch messages')
          console.error('Error fetching messages:', err)
        }
      } finally {
        if (!silent) setLoading(false)
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
      if (prev.some((m) => m._id === message._id)) return prev
      return [...prev, message]
    })
  }, [])

  const markAsRead = useCallback(async () => {
    if (!conversationId) return
    try {
      await messagesService.markAsRead(conversationId)
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }, [conversationId])

  return { messages, loading, error, hasMore, fetchMessages, addMessage, markAsRead }
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
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const sendMessage = useCallback(async (conversationId, text) => {
    if (!conversationId || !text?.trim()) {
      throw new Error('conversationId and text are required')
    }
    setLoading(true)
    setError(null)
    try {
      const response = await messagesService.sendMessage({ conversationId, text })
      return response
    } catch (err) {
      const msg = err.message || 'Failed to send message'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { sendMessage, loading, error }
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
  const [unreadCount, setUnreadCount]             = useState(0)
  const [unreadConversations, setUnreadConversations] = useState([])
  const [loading, setLoading]                     = useState(false)

  const fetchUnreadCount = useCallback(async () => {
    setLoading(true)
    try {
      const response = await messagesService.getUnreadCounts()
      setUnreadCount(response.unreadCount || 0)
      setUnreadConversations(response.unreadConversations || [])
    } catch (err) {
      console.error('Error fetching unread count:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return { unreadCount, unreadConversations, loading, fetchUnreadCount }
}