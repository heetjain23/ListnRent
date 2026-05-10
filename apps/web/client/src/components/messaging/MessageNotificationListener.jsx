import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useAuth } from '../../hooks/useAuth'
import { useMessagingContext } from '../../context/MessagingContext'
import { useSocketContext } from '../../context/SocketContext'
import { playNotificationSound } from '../../utils/notificationSound'
import { initializeNotificationSystem } from '../../utils/systemNotification'

/**
 * MessageNotificationListener
 *
 * Silent background component — renders nothing.
 * Replaces the old 5-second polling loop with socket events.
 *
 * Listens for `conversation:update` on the user's personal room and:
 * - Updates global unread counts in MessagingContext
 * - Shows toast notifications for new messages in non-active conversations
 * - Plays notification sound
 *
 * No intervals, no DB polling, zero server load.
 */
const MessageNotificationListener = () => {
  const { user }        = useAuth()
  const { getSocket }   = useSocketContext()
  const {
    setUnreadCount,
    setUnreadConversations,
    activeConversationId,
  } = useMessagingContext()

  // Track notified conversations so we don't spam toasts
  const notifiedRef     = useRef(new Set())
  const activeConvRef   = useRef(activeConversationId)
  useEffect(() => { activeConvRef.current = activeConversationId }, [activeConversationId])

  // Initialize browser notification permission on login
  useEffect(() => {
    if (user?.uid) initializeNotificationSystem()
  }, [user?.uid])

  useEffect(() => {
    const socket = getSocket()
    if (!socket || !user?.uid) return

    const handleConversationUpdate = (update) => {
      const { conversationId, senderId, unreadCount, lastMessage, otherUserName } = update

      // Update context unread totals
      setUnreadCount((prev) => Math.max(0, prev + (unreadCount || 0)))
      setUnreadConversations((prev) => {
        const existing = prev.findIndex((c) => c.conversationId === conversationId)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = { ...updated[existing], unreadCount: unreadCount || 0 }
          return updated
        }
        return [...prev, { conversationId, unreadCount: unreadCount || 0 }]
      })

      // Don't notify if:
      // 1. The current user sent the message
      // 2. User is already viewing this conversation
      // 3. Already notified for this conversation
      if (
        senderId === user.uid ||
        activeConvRef.current === conversationId ||
        notifiedRef.current.has(conversationId)
      ) {
        return
      }

      // Show toast
      const name = otherUserName || 'Someone'
      toast.success(`New message from ${name}`, {
        description: lastMessage ? `"${lastMessage.substring(0, 60)}${lastMessage.length > 60 ? '…' : ''}"` : undefined,
        duration: 4000,
      })

      playNotificationSound()
      notifiedRef.current.add(conversationId)
    }

    socket.on('conversation:update', handleConversationUpdate)

    return () => socket.off('conversation:update', handleConversationUpdate)
  }, [user?.uid, getSocket, setUnreadCount, setUnreadConversations])

  // Clear notification state when user opens a conversation
  useEffect(() => {
    if (activeConversationId) {
      notifiedRef.current.delete(activeConversationId)
      // Also reset unread count for this conversation in context
      setUnreadConversations((prev) =>
        prev.map((c) =>
          c.conversationId === activeConversationId ? { ...c, unreadCount: 0 } : c
        )
      )
    }
  }, [activeConversationId, setUnreadConversations])

  return null
}

export default MessageNotificationListener