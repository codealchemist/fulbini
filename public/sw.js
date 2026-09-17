// Minimal service worker: makes the app installable and keeps the shell
// available offline. Live football data is never cached — /api/* always
// hits the network so scores/stats stay fresh. Netlify Identity's own
// endpoints (/.netlify/identity/*) are excluded too: intercepting those with
// stale-while-revalidate can serve a stale session/settings response, or
// otherwise interfere with the auth check on load — auth state must always
// be live. Bumped to v2 to drop any previously mis-cached identity responses
// from before this exclusion existed.
const CACHE_NAME = 'fulbini-shell-v2'
const APP_SHELL = ['/', '/manifest.webmanifest', '/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/'))
    return

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
