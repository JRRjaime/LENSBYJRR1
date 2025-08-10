/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/LENSBYJRR1',   // 👈 Cambia si tu repo se llama diferente
  assetPrefix: '/LENSBYJRR1/',
  trailingSlash: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
};

export default nextConfig;
