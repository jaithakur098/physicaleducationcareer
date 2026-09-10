self.addEventListener("install", function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.registration.unregister().then(function () {
    return self.clients.claim();
  }));
});
