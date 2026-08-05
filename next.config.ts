import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        // Covers both public URLs (/object/public/**) and the signed URLs
        // used for private KYC documents (/object/sign/**).
        pathname: "/storage/v1/object/**",
      },
    ],
  },
};

export default nextConfig;
