const CACHE_NAME = "breadCrumbs-v2";
const BASE_PATH = "/BreadCrumbs/";

const APP_ASSETS = [
    BASE_PATH,
    BASE_PATH + "index.html",
    BASE_PATH + "manifest.json",
    BASE_PATH + "styles/style.css",
    BASE_PATH + "src/Main.js",
    BASE_PATH + "src/Map.js",
    BASE_PATH + "src/UserInterface.js",
    BASE_PATH + "src/Waypoints.js",
    BASE_PATH + "src/Modal.js",
    BASE_PATH + "src/Utils.js",
    BASE_PATH + "icons/icon-192.png",
    BASE_PATH + "icons/icon-512.png",
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
        url.hostname.includes("nominatim.openstreetmap.org")
    ){ return; }

    if (!url.pathname.startsWith(BASE_PATH)) { return; }

    event.respondWith(caches.match(request).then(cached => {
        return cached || fetch(request);
    }));
});