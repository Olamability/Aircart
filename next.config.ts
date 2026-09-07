import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // turbopack: {
  //   // Dynamically resolves to the absolute path of your user home folder
  //   root: path.resolve(__dirname, '../../'), 
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      
        
      },
    ],
  },
};

export default nextConfig;
