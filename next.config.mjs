/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sharp', 'heic-convert'],
  experimental: { serverActions: { bodySizeLimit: '30mb' } },
  poweredByHeader: false,
};
export default nextConfig;
