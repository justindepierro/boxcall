/**
 * BoxCall Service Worker
 * Phase 3: Offline Support - Service Worker Implementation
 *
 * Handles caching, offline functionality, and background sync for BoxCall
 */

import { registerRoute } from "workbox-routing";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { BackgroundSyncPlugin } from "workbox-background-sync";

// Cache names
const CACHE_NAMES = {
  static: "boxcall-static-v1",
  images: "boxcall-images-v1",
  fonts: "boxcall-fonts-v1",
  api: "boxcall-api-v1",
  pages: "boxcall-pages-v1",
};

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker");

  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/offline.html",
      ]);
    })
  );

  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!Object.values(CACHE_NAMES).includes(cacheName)) {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all clients
  self.clients.claim();
});

// Register routes with Workbox
if (typeof registerRoute === "function") {
  // API routes - Network First with background sync
  registerRoute(
    ({ url }) =>
      url.origin.includes("supabase.co") && url.pathname.includes("/rest/v1/"),
    new NetworkFirst({
      cacheName: CACHE_NAMES.api,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 5, // 5 minutes
        }),
        new BackgroundSyncPlugin("api-queue", {
          maxRetentionTime: 24 * 60, // 24 hours
        }),
      ],
    })
  );

  // Static images - Cache First
  registerRoute(
    ({ request }) => request.destination === "image",
    new CacheFirst({
      cacheName: CACHE_NAMES.images,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Fonts - Cache First
  registerRoute(
    ({ request }) => request.destination === "font",
    new CacheFirst({
      cacheName: CACHE_NAMES.fonts,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // Pages - Stale While Revalidate
  registerRoute(
    ({ request }) => request.mode === "navigate",
    new StaleWhileRevalidate({
      cacheName: CACHE_NAMES.pages,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 1 day
        }),
      ],
    })
  );
}

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_VERSION") {
    event.ports[0].postMessage({ version: "1.0.0" });
  }
});

// Handle background sync
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);

  if (event.tag === "api-queue") {
    event.waitUntil(syncApiQueue());
  }
});

async function syncApiQueue() {
  try {
    // Get pending requests from IndexedDB (would be implemented)
    // For now, just log that sync occurred
    console.log("[SW] Syncing API queue...");

    // Notify clients that sync completed
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETED",
        success: true,
      });
    });
  } catch (error) {
    console.error("[SW] Background sync failed:", error);

    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETED",
        success: false,
        error: error.message,
      });
    });
  }
}

// Handle push notifications (future feature)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log("[SW] Push received:", data);

    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: data.url,
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(clients.openWindow(event.notification.data || "/"));
});
