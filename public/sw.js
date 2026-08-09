// JARVIS Service Worker for Push Notifications and Offline Support

const CACHE_NAME = 'jarvis-v1';
const REMINDER_CHECK_INTERVAL = 60000; // Check every 60 seconds

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[JARVIS SW] Installing service worker...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[JARVIS SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[JARVIS SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Try to focus existing window
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            reminderId: event.notification.data?.reminderId,
          });
          return;
        }
      }
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[JARVIS SW] Notification dismissed:', event.notification.tag);
});

// Listen for messages from the main app
self.addEventListener('message', (event) => {
  console.log('[JARVIS SW] Received message:', event.data);

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, tag, data } = event.data;
    self.registration.showNotification(title, {
      body,
      tag,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      vibrate: [200, 100, 200],
      requireInteraction: true,
      data,
      actions: [
        { action: 'view', title: 'View' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    });
  }

  if (event.data.type === 'CHECK_REMINDERS') {
    checkReminders();
  }
});

// Check for due reminders
async function checkReminders() {
  try {
    const response = await fetch('/api/reminders/due');
    if (!response.ok) return;

    const dueReminders = await response.json();

    for (const reminder of dueReminders) {
      await self.registration.showNotification('JARVIS Reminder', {
        body: reminder.title + (reminder.description ? `\n${reminder.description}` : ''),
        tag: `reminder-${reminder.id}`,
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        vibrate: [200, 100, 200, 100, 200],
        requireInteraction: true,
        data: {
          reminderId: reminder.id,
          url: '/?view=reminders',
        },
        actions: [
          { action: 'view', title: 'View' },
          { action: 'snooze', title: 'Snooze 10m' },
        ],
      });
    }
  } catch (error) {
    console.error('[JARVIS SW] Error checking reminders:', error);
  }
}

// Handle notification actions
self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const reminderId = event.notification.data?.reminderId;

  if (action === 'snooze' && reminderId) {
    event.waitUntil(
      fetch('/api/reminders/snooze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reminderId, minutes: 10 }),
      })
    );
  }

  event.notification.close();
});
