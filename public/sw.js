self.addEventListener("push", (event) => {
  const data = event.data?.json?.() ?? {};
  const title = data.title || "CZK Oktoberfest";
  const body  = data.body  || "";
  const url   = data.url   || "/";

  event.waitUntil(
    (async () => {
      // Show OS notification
      await self.registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: { url },
      });

      // Also notify any open pages so they can show an in-app toast
      const clientsArr = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      for (const client of clientsArr) {
        client.postMessage({ type: "PUSH", payload: { title, body, url } });
      }
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    (async () => {
      const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = allClients.find((c) => c.url.includes(self.registration.scope));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })()
  );
});