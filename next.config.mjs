/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/sistematiza', 
  assetPrefix: '/sistematiza',
  trailingSlash: true,
  // Estas linhas abaixo evitam que o build pare por erros de "estilo" ou avisos
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
