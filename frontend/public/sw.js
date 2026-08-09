// A simple service worker to allow PWA installation
self.addEventListener("install", (event) => {
  self.skipWaiting();
  console.log("Service worker installed");
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
});

self.addEventListener("fetch", (event) => {
  // Pass through all requests
});
