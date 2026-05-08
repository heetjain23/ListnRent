import React, { useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useMessageNotifications } from '../../hooks/useMessageNotifications'
import { initializeNotificationSystem } from '../../utils/systemNotification'

/**
 * MessageNotificationListener - Silent component that listens for new message notifications
 * Add this to the root layout so it's always active when user is logged in
 * 
 * This component:
 * - Polls for new messages every 5 seconds
 * - Shows toast notifications for new messages
 * - Plays notification sounds
 * - Tracks read/unread state
 */
const MessageNotificationListener = () => {
  const { user } = useAuth()
  
  // Start polling for new messages
  useMessageNotifications(5000) // Poll every 5 seconds

  // Initialize browser notification system when user logs in
  useEffect(() => {
    if (user?.uid) {
      initializeNotificationSystem()
    }
  }, [user?.uid])

  // Silent component - returns null to render nothing
  return null
}

export default MessageNotificationListener
