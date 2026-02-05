const CACHE_NAME = "breadCrumbs-v1";

const APP_ASSETS = [
    "/",
    "/index.html",
    "/manifest.json",
    "/styles/style.css",
    "/src/Main.js",
    "/src/Map.js",
    "/src/UserInterface.js",
    "/src/Waypoints.js",
    "/src/Modal.js",
    "/src/Utils.js",
    "/icons/icon-192.png",
    "/icons/icon-512.png",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
    "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
];

self.addEventListener("install", event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)));
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))));
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    const { request } = event;
    if (request.method !== "GET") return;

    const url = new URL(request.url);
    if (url.hostname.includes("tile.openstreetmap.org") ||
        url.hostname.includes("nominatim.openstreetmap.org") ||
        url.protocol === "geo:" ||
        url.protocol.startsWith("http")){ return; }

    event.respondWith(caches.match(request).then(cached => {
        return cached || fetch(request);
    }));
});