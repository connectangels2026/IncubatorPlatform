/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    middlewareClientMaxBodySize: '200mb',
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/incubators',
        destination: '/programs',
        permanent: false,
      },
      {
        source: '/incubators/:path*',
        destination: '/programs',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
