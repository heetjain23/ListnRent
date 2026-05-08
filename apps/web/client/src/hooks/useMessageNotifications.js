import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useMessagingContext } from '../context/MessagingContext'
import * as messagesService from '../services/messagesService'
import { playNotificationSound } from '../utils/notificationSound'
import { toast } from 'sonner'

/**
 * useMessageNotifications - Polls for new messages and triggers notifications
 * This hook runs in the background and:
 * - Polls for unread message counts at regular intervals
 * - Detects new messages by comparing previous counts
 * - Shows toast notifications only for new messages
 * - Plays notification sound
 * - Handles errors gracefully with automatic reconnection
 */
export const useMessageNotifications = (pollIntervalMs = 5000) => {
  const { user } = useAuth()
  const {
    unreadConversations,
    setUnreadConversations,
    unreadCount,
    setUnreadCount,
    activeConversationId,
  } = useMessagingContext()

  // Track which conversations we've already notified about
  const notifiedConversationsRef = useRef(new Set())
  // Track previous unread counts to detect new messages
  const previousUnreadCountRef = useRef(0)
  // Track polling state for error recovery
  const pollingIntervalRef = useRef(null)
  const errorCountRef = useRef(0)
  const maxErrorsRef = useRef(5)
  const isPollingRef = useRef(false)

  /**
   * Fetch unread messages and trigger notifications if new
   */
  const checkForNewMessages = useCallback(async () => {
    if (!user?.uid || isPollingRef.current) return

    try {
      isPollingRef.current = true
      const response = await messagesService.getUnreadCounts()
      const newUnreadCount = response.unreadCount || 0
      const newUnreadConversations = response.unreadConversations || []

      // Update context state
      setUnreadCount(newUnreadCount)
      setUnreadConversations(newUnreadConversations)

      // Detect new messages by comparing counts
      const hasNewMessages = newUnreadCount > previousUnreadCountRef.current
      previousUnreadCountRef.current = newUnreadCount

      if (hasNewMessages && newUnreadConversations.length > 0) {
        // Notify about each new unread conversation
        newUnreadConversations.forEach((conversation) => {
          const conversationId = conversation.conversationId
          const unreadCount = conversation.unreadCount || 0
          const otherUserName = conversation.otherUserName || 'Someone'

          // Skip notification if:
          // 1. Already notified about this conversation
          // 2. User is currently viewing this conversation
          if (
            !notifiedConversationsRef.current.has(conversationId) &&
            conversationId !== activeConversationId
          ) {
            // Show toast notification
            toast.success(`New message from ${otherUserName}`, {
              description: `You have ${unreadCount} unread message${unreadCount > 1 ? 's' : ''}`,
              duration: 4000,
            })

            // Play notification sound
            playNotificationSound()

            // Mark as notified
            notifiedConversationsRef.current.add(conversationId)
          }
        })
      }

      // Reset error count on successful fetch
      errorCountRef.current = 0
    } catch (err) {
      errorCountRef.current++
      console.error(
        `[useMessageNotifications] Error checking messages (attempt ${errorCountRef.current}):`,
        err
      )

      // Stop polling if too many consecutive errors
      if (errorCountRef.current >= maxErrorsRef.current) {
        console.error(
          '[useMessageNotifications] Too many errors, stopping polling'
        )
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      }
    } finally {
      isPollingRef.current = false
    }
  }, [user?.uid, activeConversationId, setUnreadCount, setUnreadConversations])

  /**
   * Clear notification history when user opens a conversation
   */
  const clearNotificationForConversation = useCallback((conversationId) => {
    notifiedConversationsRef.current.delete(conversationId)
  }, [])

  /**
   * Start polling for new messages
   */
  useEffect(() => {
    if (!user?.uid) return

    // Initial check immediately
    checkForNewMessages()

    // Set up polling interval
    pollingIntervalRef.current = setInterval(
      checkForNewMessages,
      pollIntervalMs
    )

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [user?.uid, pollIntervalMs, checkForNewMessages])

  /**
   * Clear notifications when actively viewing a conversation
   */
  useEffect(() => {
    if (activeConversationId) {
      clearNotificationForConversation(activeConversationId)
    }
  }, [activeConversationId, clearNotificationForConversation])

  return {
    unreadCount,
    unreadConversations,
    clearNotificationForConversation,
  }
}
