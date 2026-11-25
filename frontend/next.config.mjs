/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  async redirects() {
    return [{ source: '/', destination: '/geospatial', permanent: false }]
  },
}

export default nextConfig
