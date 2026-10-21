/** @type {import('next').NextConfig} */
const nextConfig = {
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
