self.addEventListener("push", (event) => {
  const data = event.data?.json?.() ?? {};
  const title = data.title || "CZK Oktoberfest";
  const body  = data.body  || "";
  const url   = data.url   || "/";

  event.waitUntil(
    self.registration.showNotification(title, {
      body, icon: "/logo.svg", badge: "/logo.svg", data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil((async () => {
    const clientsArr = await clients.matchAll({ type: "window", includeUncontrolled: true });
    const existing = clientsArr.find((c) => c.url.includes(self.registration.scope));
    if (existing) return existing.focus();
    return clients.openWindow(url);
  })());
});