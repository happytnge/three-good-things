import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 応答ヘッダーの初期設定（2026-10-23。雛形は SKS/blog の next.config.ts）
  // frame-ancestors / X-Frame-Options: よそのサイトの枠（iframe）に入れさせない（クリックジャッキング対策）
  // object-src / base-uri: プラグインや <base> で読み込み先を差し替えられないようにする
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  poweredByHeader: false, // x-powered-by: Next.js を出さない

  /* config options here */
}

export default nextConfig
