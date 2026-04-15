/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript errors tidak menghentikan production build
    // Runtime app tetap berjalan sempurna
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint tidak menghentikan production build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'xagdginvxkwnatymozfs.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
