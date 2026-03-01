// Service Worker for Push Notifications — unconsciousness

self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  const title = data.title || "✦ Il tuo cielo oggi";
  const options = {
    body: data.body || "Le stelle hanno un messaggio per te.",
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    data: { url: data.url || "/oggi" },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/oggi";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
