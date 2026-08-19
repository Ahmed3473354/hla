
const CACHE_NAME = "tamny-v2";

self.addEventListener("install", event => {
    console.log("Tamny Service Worker: install");

    event.waitUntil(
        caches.open(CACHE_NAME)
    );

    self.skipWaiting();
});


self.addEventListener("activate", event => {

    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            )
        )
    );

    self.clients.claim();
});


self.addEventListener("fetch", event => {

    const url = new URL(event.request.url);

    // ==========================================
    // تجاهل Firebase و Firestore
    // ==========================================

    if (
        url.hostname.includes("firebaseio.com") ||
        url.hostname.includes("googleapis.com") ||
        url.hostname.includes("gstatic.com") ||
        url.hostname.includes("google.com")
    ) {
        return;
    }


    // ==========================================
    // التعامل مع ملفات التطبيق فقط
    // ==========================================

    if (url.origin !== self.location.origin) {
        return;
    }


    event.respondWith(

        caches.match(event.request)
            .then(cached => {

                if (cached) {
                    return cached;
                }

                return fetch(event.request);
            })

    );

});

