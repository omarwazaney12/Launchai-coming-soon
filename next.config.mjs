/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false, // Disable SWC minification
  output: 'standalone',
  experimental: {
    optimizeCss: false,
    optimizeServerReact: false,
    optimizePackageImports: [],
    serverMinification: false,
    serverSourceMaps: false,
    bundlePagesExternals: false,
    forceSwcTransforms: false
  },
  webpack: (config, { isServer }) => {
    // Disable some webpack optimizations
    config.optimization.minimize = false;
    return config;
  },
  // Workaround for the micromatch issue
  trailingSlash: true
}

export default nextConfig; 