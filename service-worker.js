const CACHE_NAME = 'moneynote-v1';
const ASSETS = [
    './index2.html',
    // 缓存外部资源，让没网也能看到特效和图表
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js',
    'https://cdn.jsdelivr.net/npm/echarts@5.5.0/dist/echarts.min.js'
];

// 安装：缓存文件
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
});

// 拦截请求：断网时从缓存读取
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});