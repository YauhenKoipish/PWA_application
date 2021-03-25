const staticCacheName = "s-app-v4";
const dynamicCacheName = "d-app-v4";

const assetUrls = [
  "index.html",
  "/js/app.js",
  "/css/styles.css",
  "/offline.html",
];

self.addEventListener("install", async () => {
  const cache = await caches.open(staticCacheName);
  await cache.addAll(assetUrls);
});

self.addEventListener("activate", async () => {
  const cacheNames = await caches.keys();
  Promise.all(
    cacheNames
      .filter((name) => name !== staticCacheName)
      .filter((name) => name !== dynamicCacheName)
      .map((name) => caches.delete(name))
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === location.origin) {
    event.respondWith(cacheFirst(request));
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(req) {
  const cached = await caches.match(req);

  return cached ?? fetch(req);
}

async function networkFirst(req) {
  const cache = await caches.open(dynamicCacheName);

  try {
    const response = await fetch(req);
    cache.put(req, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(req);
    return cached ?? (await caches.match("/offline.html"));
  }
}
