/**
 * Notification sound utilities
 * Uses Web Audio API for cross-browser support
 */

let lastSoundTime = 0;
const SOUND_DEBOUNCE_MS = 1000;

/**
 * Generate a simple beep sound using Web Audio API
 */
const playBeep = async (frequency = 800, duration = 200, volume = 0.3) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return false;

    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + duration / 1000
    );

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration / 1000);

    return true;
  } catch (err) {
    console.warn("[Notification Sound] Failed to play:", err);
    return false;
  }
};

/**
 * Play notification sound (800Hz, 200ms)
 * Debounced to max 1 sound per second
 */
export const playNotificationSound = async () => {
  const now = Date.now();
  if (now - lastSoundTime < SOUND_DEBOUNCE_MS) {
    return false;
  }

  lastSoundTime = now;
  return await playBeep(800, 200, 0.3);
};

/**
 * Play error sound (400Hz, 300ms)
 * Debounced to max 1 sound per second
 */
export const playErrorSound = async () => {
  const now = Date.now();
  if (now - lastSoundTime < SOUND_DEBOUNCE_MS) {
    return false;
  }

  lastSoundTime = now;
  return await playBeep(400, 300, 0.25);
};

/**
 * Request notification permission from browser
 */
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.warn("[Notifications] Not supported in this browser");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission === "denied") {
    return false;
  }

  // Request permission
  try {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  } catch (err) {
    console.error("[Notification Permission] Failed:", err);
    return false;
  }
};

/**
 * Show browser notification
 */
export const showBrowserNotification = (title, options = {}) => {
  if (!("Notification" in window)) {
    return null;
  }

  if (Notification.permission !== "granted") {
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: "/logo-192.png",
      badge: "/logo-192.png",
      tag: "message-notification",
      ...options,
    });

    return notification;
  } catch (err) {
    console.error("[Browser Notification] Failed:", err);
    return null;
  }
};

/**
 * Show system notification for new message
 */
export const showNewMessageNotification = (
  senderName,
  messagePreview,
  conversationId,
  onClickCallback
) => {
  const title = `New message from ${senderName}`;
  const body = messagePreview || "You have a new message";

  const notification = showBrowserNotification(title, {
    body,
    tag: `msg-${conversationId}`,
    requireInteraction: false,
  });

  if (notification && onClickCallback) {
    notification.onclick = () => {
      window.focus();
      onClickCallback(conversationId);
      notification.close();
    };
  }

  return notification;
};
