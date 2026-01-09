import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Eskiden experimental içindeydi, artık bu şekilde kullanılmalı
  serverExternalPackages: ["fs", "path"],

  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "**",
      },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },

  webpack: (config) => {
    if (config.module && config.module.rules) {
      config.module.rules.push({
        test: /\.(mp4|webm|ogg|swf|ogv)$/,
        use: {
          loader: "file-loader",
          options: {
            publicPath: "/_next/static/videos/",
            outputPath: "static/videos/",
            name: "[name].[hash].[ext]",
          },
        },
      });
    }
    return config;
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
