import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // API 代理配置（解决 CORS）
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://localhost:8000/api/v1/:path*",
      },
    ];
  },

  // 环境变量
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },

  // 类型化路由
  typedRoutes: true,

  // 禁用 ESLint 检查（存在配置问题）
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
