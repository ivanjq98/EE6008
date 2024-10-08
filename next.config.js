/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['d3-array', 'd3-scale'],
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL
  }
}

module.exports = nextConfig
