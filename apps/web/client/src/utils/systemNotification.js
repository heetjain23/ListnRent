/**
 * systemNotification.js
 *
 * Thin utility for browser Notification API permission management.
 * The actual notification display logic lives in MessageNotificationListener
 * where it has access to message context.
 */

/**
 * Request Notification permission from the browser.
 * Safe to call multiple times — subsequent calls are no-ops if
 * permission is already granted or denied.
 *
 * @returns {Promise<'granted'|'denied'|'default'|'unsupported'>}
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
};

/**
 * @deprecated Use requestNotificationPermission() instead.
 * Kept for backward compatibility with any existing imports.
 */
export const initializeNotificationSystem = () => {
  requestNotificationPermission().catch(() => {});
};

/**
 * Check if device notifications are available and granted.
 */
export const canShowDeviceNotifications = () =>
  "Notification" in window && Notification.permission === "granted";