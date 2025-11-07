/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  // Явно указываем, что статические файлы должны обслуживаться
  // Next.js автоматически обслуживает файлы из public/ по корневому пути
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      // Добавляем заголовки для статических изображений
      {
        source: '/og-image.png',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/telegram-cover.png',
        headers: [
          {
            key: 'Content-Type',
            value: 'image/png',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
