import { useState, useCallback } from 'react'
import * as messagesService from '../services/messagesService.js'

// Hook for managing a single conversation
export const useConversation = (conversationId) => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  // Fetch messages for the conversation
  const fetchMessages = useCallback(
    async (limit = 50, skip = 0, silent = false) => {
      if (!conversationId) return
      if (!silent) setLoading(true)
      setError(null)
      try {
        const response = await messagesService.getMessages(
          conversationId,
          limit,
          skip
        )
        
        if (silent && skip === 0) {
          // For background polling: only add new messages, don't replace
          setMessages((prev) => {
            const prevIds = new Set(prev.map((m) => m._id))
            const newMessages = (response.messages || []).filter((m) => !prevIds.has(m._id))
            return [...prev, ...newMessages]
          })
        } else if (skip === 0) {
          // For initial load: replace all messages
          setMessages(response.messages || [])
        } else {
          // For pagination: prepend messages
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

  // Add a new message to the conversation
  const addMessage = useCallback((message) => {
    setMessages((prev) => [...prev, message])
  }, [])

  // Mark conversation as read
  const markAsRead = useCallback(async () => {
    if (!conversationId) return
    try {
      await messagesService.markAsRead(conversationId)
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }, [conversationId])

  return {
    messages,
    loading,
    error,
    hasMore,
    fetchMessages,
    addMessage,
    markAsRead,
  }
}

// Hook for managing conversations list
export const useConversations = () => {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  // Fetch user conversations
  const fetchConversations = useCallback(async (limit = 20, skip = 0) => {
    setLoading(true)
    setError(null)
    try {
      const response = await messagesService.getConversations(limit, skip)
      const conversationsData = response.conversations || response || []
      if (skip === 0) {
        setConversations(Array.isArray(conversationsData) ? conversationsData : [])
      } else {
        setConversations((prev) => [
          ...prev,
          ...(Array.isArray(conversationsData) ? conversationsData : []),
        ])
      }
      setHasMore(
        (Array.isArray(conversationsData) ? conversationsData : []).length ===
          limit
      )
    } catch (err) {
      setError(err.message || 'Failed to fetch conversations')
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Add or update a conversation at the top
  const addOrUpdateConversation = useCallback((conversation) => {
    setConversations((prev) => {
      const index = prev.findIndex((c) => c._id === conversation._id)
      if (index >= 0) {
        // Update existing and move to top
        const updated = [...prev]
        updated.splice(index, 1)
        return [conversation, ...updated]
      }
      return [conversation, ...prev]
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

// Hook for sending messages
export const useSendMessage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(async (listingId, recipientId, text) => {
    setLoading(true)
    setError(null)
    try {
      const response = await messagesService.sendMessage({
        listingId,
        recipientId,
        text,
      })
      return response
    } catch (err) {
      const errorMsg = err.message || 'Failed to send message'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    sendMessage,
    loading,
    error,
  }
}

// Hook for getting or creating a conversation
export const useGetOrCreateConversation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getOrCreate = useCallback(async (listingId, otherUserId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await messagesService.getOrCreateConversation(listingId, otherUserId)
      return response
    } catch (err) {
      const errorMsg = err.message || 'Failed to get/create conversation'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getOrCreate,
    loading,
    error,
  }
}

// Hook for unread counts
export const useUnreadCount = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadConversations, setUnreadConversations] = useState([])
  const [loading, setLoading] = useState(false)

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

  return {
    unreadCount,
    unreadConversations,
    loading,
    fetchUnreadCount,
  }
}
