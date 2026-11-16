/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    // In production / Docker, internal backend is always 'http://backend:8080'
    // In local development on laptop host machine without Docker, it falls back to 'http://localhost:8080'
    const isLocalDev = process.env.NODE_ENV === 'development' && !process.env.IS_DOCKER;
    const defaultBackend = isLocalDev ? 'http://localhost:8080' : 'http://backend:8080';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaultBackend;

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

