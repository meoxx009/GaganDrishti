// GaganDrishti PWA Service Worker (v2.0)
// High-performance caching, offline navigation fallback, and push notifications

const CACHE_NAME = "gagandrishti-pwa-v2";
const OFFLINE_URL = "/offline.html";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  OFFLINE_URL,
  "/images/icon-192x192.png",
  "/images/icon-192x192-maskable.png",
  "/images/icon-512x512.png",
  "/images/icon-512x512-maskable.png",
  "/images/icon-weather-96.png",
  "/images/icon-advice-96.png",
  "/images/icon-pest-96.png",
  "/images/screenshot-1.png",
  "/images/screenshot-2.png"
];

// 1. Install Event: Cache App Shell & Offline Fallback
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn("[PWA SW] Precache warning during install:", err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up old cache versions & claim clients
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log("[PWA SW] Removing old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Network-First with Offline Fallback
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // A. Navigation requests (Page loading)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache successful page navigations
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, try cached page first, then fallback to offline.html
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          const offlinePage = await caches.match(OFFLINE_URL);
          return offlinePage || new Response("GaganDrishti is offline", {
            headers: { "Content-Type": "text/plain" }
          });
        })
    );
    return;
  }

  // B. Dynamic weather & chat APIs: Network-first, fallback to cache
  if (
    url.pathname.startsWith("/api/") ||
    url.hostname.includes("open-meteo.com") ||
    url.hostname.includes("googleapis.com")
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && request.method === "GET") {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // C. Static Assets (CSS, JS, Fonts, Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && request.method === "GET") {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// 4. Push Notification Event (Step 10)
self.addEventListener("push", (event) => {
  let data = {
    title: "GaganDrishti Weather Alert",
    body: "New agricultural weather advisory available for your district.",
    icon: "/images/icon-192x192.png",
    badge: "/images/icon-weather-96.png",
    url: "/?utm_source=push_notification",
  };

  try {
    if (event.data) {
      data = Object.assign(data, event.data.json());
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/images/icon-192x192.png",
    badge: data.badge || "/images/icon-weather-96.png",
    vibrate: [200, 100, 200],
    data: {
      url: data.url || "/",
    },
    actions: [
      { action: "open_app", title: "📱 View Advisory (खोलें)" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 5. Notification Click Action
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});
