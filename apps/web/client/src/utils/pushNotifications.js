import { api } from "../services/api";

const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export const canUsePushNotifications = () => {
  return Boolean(
    publicVapidKey &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window,
  );
};

export const registerMessagePushSubscription = async () => {
  if (!canUsePushNotifications()) return { ok: false, reason: "unsupported" };

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") {
    return { ok: false, reason: permission };
  }

  const registration =
    await navigator.serviceWorker.register("/listnrent-sw.js");

  // Wait for the SW to be active before subscribing — avoids race where
  // pushManager.subscribe() is called before the SW has claimed the page.
  await navigator.serviceWorker.ready;

  // Bug 1 fix: always re-send the subscription to the server.
  // The server may have lost it (restart / DB wipe), so reusing an existing
  // browser subscription without re-saving it leaves the server with no record.
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    });
  }

  // Always POST — the server upserts by endpoint so this is idempotent.
  await api("/api/messages/push-subscriptions", {
    method: "POST",
    auth: true,
    body: JSON.stringify(subscription.toJSON()),
  });

  return { ok: true };
};
