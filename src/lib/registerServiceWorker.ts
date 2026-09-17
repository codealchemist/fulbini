// Registered only in production builds — a SW registered against the Vite
// dev server would cache module scripts and cause confusing stale-HMR bugs.
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Installability is a progressive enhancement — ignore registration failures.
    })
  })
}
