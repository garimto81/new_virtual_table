// ===================================
// Service Worker - Hand Logger PWA
// ===================================

const CACHE_VERSION = 'hand-logger-v1.0.0';
const CACHE_NAME = `hand-logger-${CACHE_VERSION}`;

// 캐시할 정적 파일 목록
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/config.js',
  '/js/api.js',
  '/js/ui.js',
  '/js/utils.js',
  '/js/db.js',
  '/js/sync.js',
  '/js/table-manager.js',
  '/js/hand-recorder.js'
];

// Install 이벤트 - Service Worker 설치 시
self.addEventListener('install', (event) => {
  console.log('[SW] Install:', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] 정적 파일 캐싱 시작');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // 즉시 활성화
  );
});

// Activate 이벤트 - Service Worker 활성화 시
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate:', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        // 이전 버전 캐시 삭제
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('hand-logger-') && name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] 이전 캐시 삭제:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim()) // 즉시 제어권 획득
  );
});

// Fetch 이벤트 - 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Google Sheets API는 항상 네트워크 우선 (최신 데이터)
  if (url.hostname === 'sheets.googleapis.com') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          // 오프라인 시 IndexedDB에서 캐시된 데이터 사용
          console.log('[SW] API 오프라인 - IndexedDB 캐시 사용');
          return new Response(JSON.stringify({ offline: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // 정적 파일: Cache First 전략 (빠른 로딩)
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request)
        .then(cached => {
          if (cached) {
            console.log('[SW] 캐시 사용:', url.pathname);
            return cached;
          }

          // 캐시 없으면 네트워크에서 가져오고 캐싱
          return fetch(request)
            .then(response => {
              // 200 응답만 캐싱
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(request, responseClone);
                  });
              }
              return response;
            })
            .catch(error => {
              console.error('[SW] 네트워크 오류:', error);
              // 오프라인 페이지 반환 (옵션)
              return new Response('오프라인 상태입니다', {
                status: 503,
                statusText: 'Service Unavailable'
              });
            });
        })
    );
  }
});

// Background Sync 이벤트 (향후 확장)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-hands') {
    console.log('[SW] Background Sync: sync-hands');
    event.waitUntil(
      // IndexedDB syncQueue 처리
      // 현재는 sync.js에서 10초 간격으로 처리
      Promise.resolve()
    );
  }
});

// Push 알림 (향후 확장)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Hand Logger';
  const options = {
    body: data.body || '새로운 알림이 있습니다',
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
