// sw.js — โหมดอัปเดตอัตโนมัติเมื่อมีเน็ต และใช้แคชเมื่อออฟไลน์
const CACHE_NAME = 'swift-qr-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/bootstrap.min.css',
  './css/style.css',
  './js/qr-code-styling.js',
  './js/index.js',
  './SwiftQR.webp'
];

// 1. ติดตั้งและเก็บแคชเริ่มต้น
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. เคลียร์แคชเก่าทิ้งเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. กลยุทธ์ Network First (เช็กเน็ต/อัปเดตก่อน ถ้าไม่มีเน็ตถึงใช้แคช)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // ถ้าเชื่อมต่ออินเทอร์เน็ตได้ ระบบจะทำการอัปเดตไฟล์เวอร์ชันล่าสุดเก็บลง Cache ไว้
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // ถ้าปิดเน็ต หรือไม่มีสัญญาณอินเทอร์เน็ต ระบบจะดึงไฟล์จาก Cache ในเครื่องมาใช้ทันที
        return caches.match(event.request);
      })
  );
});