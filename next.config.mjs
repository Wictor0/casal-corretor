/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sharp'],
  experimental: { serverActions: { bodySizeLimit: '30mb' } },
  poweredByHeader: false,
};
export default nextConfig;
