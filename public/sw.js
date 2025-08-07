/**
 * Advanced Service Worker
 * Part of Phase 3D: Final Mobile Polish & Performance Optimization
 */

// Service worker version for cache invalidation
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `boxcall-${CACHE_VERSION}`;

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: "cache-first",
  NETWORK_FIRST: "network-first",
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
  NETWORK_ONLY: "network-only",
  CACHE_ONLY: "cache-only",
};

// Cache configurations
const CACHE_CONFIG = {
  static: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    patterns: [/\.(js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/, /\/assets\//],
  },
  api: {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 5 * 60 * 1000, // 5 minutes
    patterns: [/\/api\//],
  },
  pages: {
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    patterns: [/\/$/, /\/dashboard/, /\/teams/, /\/plays/],
  },
  images: {
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    patterns: [/\.(png|jpg|jpeg|gif|svg|webp|avif)$/],
  },
};

// Offline fallbacks
const OFFLINE_FALLBACKS = {
  page: "/offline.html",
  image: "/assets/offline-image.svg",
  font: "/assets/fonts/fallback.woff2",
};

// Background sync configuration
const BACKGROUND_SYNC_CONFIG = {
  enabled: true,
  maxRetryTime: 5 * 60 * 1000, // 5 minutes
  retryDelays: [1000, 5000, 15000], // 1s, 5s, 15s
};

// Install event - Cache critical resources
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing...");

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);

        // Critical resources to cache immediately
        const criticalResources = [
          "/",
          "/offline.html",
          "/assets/offline-image.svg",
          "/manifest.json",
        ];

        await cache.addAll(criticalResources);
        console.log("✅ Critical resources cached");

        // Skip waiting to activate immediately
        self.skipWaiting();
      } catch (error) {
        console.error("❌ Service Worker installation failed:", error);
      }
    })()
  );
});

// Activate event - Clean up old caches
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activating...");

  event.waitUntil(
    (async () => {
      try {
        // Clean up old caches
        const cacheNames = await caches.keys();
        const deletePromises = cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name));

        await Promise.all(deletePromises);
        console.log("🧹 Old caches cleaned up");

        // Take control of all clients immediately
        await self.clients.claim();
        console.log("✅ Service Worker activated");
      } catch (error) {
        console.error("❌ Service Worker activation failed:", error);
      }
    })()
  );
});

// Fetch event - Handle all network requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const { url, method, destination } = request;

  // Only handle GET requests
  if (method !== "GET") return;

  // Skip chrome-extension and similar requests
  if (!url.startsWith("http")) return;

  event.respondWith(handleRequest(request));
});

// Main request handler
async function handleRequest(request) {
  const url = new URL(request.url);
  const cacheConfig = getCacheConfig(request);

  try {
    switch (cacheConfig.strategy) {
      case CACHE_STRATEGIES.CACHE_FIRST:
        return await cacheFirst(request, cacheConfig);
      case CACHE_STRATEGIES.NETWORK_FIRST:
        return await networkFirst(request, cacheConfig);
      case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
        return await staleWhileRevalidate(request, cacheConfig);
      case CACHE_STRATEGIES.NETWORK_ONLY:
        return await fetch(request);
      case CACHE_STRATEGIES.CACHE_ONLY:
        return await cacheOnly(request);
      default:
        return await fetch(request);
    }
  } catch (error) {
    console.error("❌ Request handling failed:", error);
    return await getOfflineFallback(request);
  }
}

// Cache-first strategy
async function cacheFirst(request, config) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Check if cache is expired
    const cacheTime = await getCacheTime(request);
    if (cacheTime && Date.now() - cacheTime > config.maxAge) {
      // Cache expired, fetch fresh data in background
      fetch(request)
        .then((response) => {
          if (response.ok) {
            cache.put(request, response.clone());
            setCacheTime(request);
          }
        })
        .catch(() => {}); // Ignore background fetch errors
    }
    return cachedResponse;
  }

  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
    setCacheTime(request);
  }

  return networkResponse;
}

// Network-first strategy
async function networkFirst(request, config) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      setCacheTime(request);
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, config) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch fresh data in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
        setCacheTime(request);
      }
      return response;
    })
    .catch(() => {}); // Ignore errors

  // Return cached response immediately, or wait for network
  if (cachedResponse) {
    fetchPromise; // Fire and forget
    return cachedResponse;
  }

  return await fetchPromise;
}

// Cache-only strategy
async function cacheOnly(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (!cachedResponse) {
    throw new Error("No cached response available");
  }

  return cachedResponse;
}

// Get cache configuration for request
function getCacheConfig(request) {
  const url = new URL(request.url);

  for (const [type, config] of Object.entries(CACHE_CONFIG)) {
    for (const pattern of config.patterns) {
      if (pattern.test(url.pathname) || pattern.test(url.href)) {
        return config;
      }
    }
  }

  // Default strategy
  return {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    maxAge: 60 * 1000, // 1 minute
  };
}

// Get offline fallback
async function getOfflineFallback(request) {
  const destination = request.destination;
  const url = new URL(request.url);

  if (destination === "document" || url.pathname.endsWith(".html")) {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match(OFFLINE_FALLBACKS.page);
  }

  if (destination === "image") {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match(OFFLINE_FALLBACKS.image);
  }

  if (destination === "font") {
    const cache = await caches.open(CACHE_NAME);
    return await cache.match(OFFLINE_FALLBACKS.font);
  }

  // Return generic offline response
  return new Response("Offline", {
    status: 503,
    statusText: "Service Unavailable",
    headers: { "Content-Type": "text/plain" },
  });
}

// Cache time management
async function setCacheTime(request) {
  const timeCache = await caches.open(`${CACHE_NAME}-timestamps`);
  const timeResponse = new Response(Date.now().toString());
  await timeCache.put(request.url, timeResponse);
}

async function getCacheTime(request) {
  try {
    const timeCache = await caches.open(`${CACHE_NAME}-timestamps`);
    const timeResponse = await timeCache.match(request.url);
    if (timeResponse) {
      const timeText = await timeResponse.text();
      return parseInt(timeText, 10);
    }
  } catch (error) {
    console.error("Error getting cache time:", error);
  }
  return null;
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  console.log("🔄 Handling background sync...");

  try {
    // Get pending actions from IndexedDB or cache
    const pendingActions = await getPendingActions();

    for (const action of pendingActions) {
      try {
        await processAction(action);
        await removePendingAction(action.id);
        console.log("✅ Background sync action completed:", action.type);
      } catch (error) {
        console.error("❌ Background sync action failed:", error);
        // Action will retry on next sync
      }
    }
  } catch (error) {
    console.error("❌ Background sync failed:", error);
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: data.icon || "/assets/icon-192x192.png",
    badge: data.badge || "/assets/badge-72x72.png",
    image: data.image,
    data: data.data,
    actions: data.actions,
    tag: data.tag,
    renotify: true,
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data;
  let url = data?.url || "/";

  // Handle action buttons
  if (event.action) {
    switch (event.action) {
      case "view":
        url = data?.viewUrl || url;
        break;
      case "dismiss":
        return; // Just close the notification
      default:
        url = data?.actionUrl || url;
    }
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Check if there's already a window/tab open
      for (const client of clients) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window/tab
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Message handling from main thread
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;
    case "GET_VERSION":
      event.ports[0].postMessage({ version: CACHE_VERSION });
      break;
    case "CLEAR_CACHE":
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    case "ADD_TO_CACHE":
      addToCache(data.urls).then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
    default:
      console.warn("Unknown message type:", type);
  }
});

// Helper functions for message handling
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log("🧹 All caches cleared");
}

async function addToCache(urls) {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(urls);
  console.log("➕ URLs added to cache:", urls);
}

// Placeholder functions for background sync (implement based on your needs)
async function getPendingActions() {
  // Implement based on your offline action storage
  return [];
}

async function processAction(action) {
  // Implement based on your action types
  console.log("Processing action:", action);
}

async function removePendingAction(actionId) {
  // Implement based on your storage mechanism
  console.log("Removing action:", actionId);
}

console.log("🚀 BoxCall Service Worker loaded successfully");
