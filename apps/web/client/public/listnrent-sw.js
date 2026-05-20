self.addEventListener('push', (event) => {
  if (!event.data) return

  let data = {}
  try {
    data = event.data.json()
  } catch {
    data = { title: 'ListnRent', body: event.data.text() }
  }

  const title = data.title || 'ListnRent'
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/apple-touch-icon.png',
    badge: '/apple-touch-icon.png',
    tag: data.tag || 'listnrent-message',
    renotify: true,
    data: {
      url: data.url || '/dashboard',
      conversationId: data.conversationId,
    },
  }

  // Bug 2 fix: filter out service worker clients — only window clients count.
  // On some browsers self.clients.matchAll returns the SW itself, making
  // clients.length always >= 1 and suppressing every notification.
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Only suppress if a visible window is actually focused on this origin.
        const hasFocusedWindow = clients.some(
          (c) => c.visibilityState === 'visible' && c.focused
        )
        if (hasFocusedWindow) return
        return self.registration.showNotification(title, options)
      })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = new URL(
    event.notification.data?.url || '/dashboard',
    self.location.origin
  ).href

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Focus an existing window if one is open, otherwise open a new one.
        for (const client of clients) {
          if (client.url === targetUrl && 'focus' in client) {
            return client.focus()
          }
        }
        // No matching window — navigate any open window or open fresh.
        for (const client of clients) {
          if ('navigate' in client) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
        return self.clients.openWindow(targetUrl)
      })
  )
})

// Immediately claim clients so the SW activates without a page reload.
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})