/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Isso avisa ao Next.js para gerar arquivos HTML estáticos
  images: {
    unoptimized: true, // Necessário para o GitHub Pages
  },
  // Substitua 'sistematiza' pelo nome exato do seu repositório no GitHub
  basePath: '/sistematiza', 
  assetPrefix: '/sistematiza',
};

export default nextConfig;
