/**
 * System Notification utilities
 * Handles browser notification permissions and integration
 */

/**
 * Request notification permission from the browser
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn('[Notification] Browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (err) {
      console.warn('[Notification] Failed to request permission:', err)
      return false
    }
  }

  return false
}

/**
 * Show system notification if permitted
 */
export const showSystemNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false
  }

  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'listnrent-message',
      ...options,
    })
    return true
  } catch (err) {
    console.warn('[Notification] Failed to show notification:', err)
    return false
  }
}

/**
 * Initialize notification system
 * Request permissions if needed
 */
export const initializeNotificationSystem = async () => {
  try {
    const hasPermission = await requestNotificationPermission()
    if (hasPermission) {
      console.log('[Notification] System notifications enabled')
    }
  } catch (err) {
    console.warn('[Notification] Failed to initialize:', err)
  }
}
