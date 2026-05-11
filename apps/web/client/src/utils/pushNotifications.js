import { api } from '../services/api'

const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

export const canUsePushNotifications = () => {
  return Boolean(
    publicVapidKey &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export const registerMessagePushSubscription = async () => {
  if (!canUsePushNotifications()) return { ok: false, reason: 'unsupported' }

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission()

  if (permission !== 'granted') {
    return { ok: false, reason: permission }
  }

  const registration = await navigator.serviceWorker.register('/listnrent-sw.js')
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    }))

  await api('/api/messages/push-subscriptions', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(subscription.toJSON()),
  })

  return { ok: true }
}
