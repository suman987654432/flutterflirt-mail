/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    const isDocker = process.env.IS_DOCKER === 'true' || process.env.NEXT_PUBLIC_API_URL?.includes('backend');
    const fallbackUrl = isDocker ? 'http://backend:8080' : 'http://localhost:8080';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || fallbackUrl;

    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

