/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/sistematiza', 
  assetPrefix: '/sistematiza',
  trailingSlash: true, // Adicione esta linha para facilitar a navegação no GitHub Pages
};

export default nextConfig;
