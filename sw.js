// ===== DrDer-Switch - Service Worker =====

const CACHE_NAME = 'drder-switch-v3';
const CACHE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './game.js',
    './app.js',
    './manifest.json',
    './192.png',
    './512.png'
];

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching app assets...');
                return cache.addAll(CACHE_ASSETS);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// تفعيل Service Worker وتنظيف الكاش القديم
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                return self.clients.claim();
            })
    );
});

// استراتيجية Cache First مع Fallback للشبكة
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // إذا وجد الملف في الكاش، أرسله مباشرة
                if (cachedResponse) {
                    return cachedResponse;
                }
                
                // إذا لم يوجد في الكاش، حاول جلبه من الشبكة
                return fetch(event.request)
                    .then((response) => {
                        // تحقق من صحة الاستجابة
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // تخزين نسخة من الاستجابة في الكاش
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(() => {
                        // في حالة عدم وجود إنترنت وعدم وجود الملف في الكاش
                        // إرجاع صفحة البداية كـ fallback
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// معالجة الأخطاء
self.addEventListener('error', (event) => {
    console.error('Service Worker error:', event.error);
});
