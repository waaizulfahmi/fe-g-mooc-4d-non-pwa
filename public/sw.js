// eslint-disable-next-line no-unused-vars
const OFFLINE_VERSION = 1;
const CACHE_NAME = 'offline';
// const OFFLINE_URL = ['/offline.html', '/no-internet.png'];
const OFFLINE_URL = '/offline.html';


self.addEventListener('install', (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));

            // await cache.addAll(OFFLINE_URL.map((url) => new Request(url, { cache: 'reload' })));
        })(),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        (async () => {
            if ('navigationPreload' in self.registration) {
                await self.registration.navigationPreload.enable();
            }
        })(),
    );

    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            (async () => {
                try {
                    const preloadResponse = await event.preloadResponse;
                    if (preloadResponse) {
                        return preloadResponse;
                    }

                    // Always try the network first.
                    const networkResponse = await fetch(event.request);
                    return networkResponse;
                } catch (error) {
                    console.log('Fetch failed; returning offline page instead.', error);

                    const cache = await caches.open(CACHE_NAME);
                    const cachedResponse = await cache.match(OFFLINE_URL);
                    return cachedResponse;

                    // Coba mencari kedua file "offline.html" dan "sound.wav" dalam cache
                    // const [offlineHtmlResponse, soundResponse] = await Promise.all([
                    //     cache.match('/offline.html'),
                    //     cache.match('/sound.wav'),
                    //     cache.match('/images/favicon.ico'),
                    // ]);

                    // if (offlineHtmlResponse && soundResponse) {
                    //     return offlineHtmlResponse;
                    // } else {
                    //     return new Response('404 Not Found', {
                    //         status: 404,
                    //         statusText: 'Not Found',
                    //         headers: new Headers({
                    //             'Content-Type': 'text/plain',
                    //         }),
                    //     });
                    // }
                }
            })(),
        );
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
});

self.addEventListener('push', (event) => {
    const options = {
        body: 'Halloo Pengguna',
        icon: 'icon.png', // Ganti dengan ikon notifikasi Anda
        badge: 'badge.png', // Ganti dengan badge notifikasi Anda
        // sound: '/sound.wav', // Ganti dengan file suara notifikasi Anda
    };

    event.waitUntil(self.registration.showNotification('Selamat Datang Kembali Pengguna', options));
});
