/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: ["sherril-exoskeletal-heinously.ngrok-free.dev"],
};

export default nextConfig;
