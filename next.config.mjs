/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/dashboard',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
