import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 allows only listed qualities (default [75]). 90 is for `/start`'s space images — stars are single bright
    // points, and 75 softens them (15 October 2026, Carl: "can you sharpen it?"). Every other image keeps the default 75.
    qualities: [75, 90],
  },
};

export default nextConfig;
