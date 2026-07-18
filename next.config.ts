import type { NextConfig } from "next";

// GitHub Pages のプロジェクトサイトは
//   https://<user>.github.io/<repo>/
// というサブパス配下で配信される。このリポジトリ名に合わせる。
const repoName = "ado-roulette";

// 本番（GitHub Actions 上）ビルドのときだけサブパスを付ける。
// ローカルの `npm run dev` では basePath なしで動かしたいので分岐する。
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ① 静的エクスポート: `next build` で out/ に純粋な HTML/CSS/JS を出力する。
  //    GitHub Pages は静的ファイルしか配信できないため必須。
  output: "export",

  // ② サブパス配下で動かすための設定。
  basePath: isProd ? `/${repoName}` : "",
  // 静的アセット（JS/CSS）の参照先プレフィックス。basePath と揃える。
  assetPrefix: isProd ? `/${repoName}/` : "",

  // ③ 静的エクスポートでは Next.js の画像最適化サーバーが使えないため無効化。
  images: { unoptimized: true },

  // ④ 各ルートを `foo/index.html` 形式で出力し、末尾スラッシュURLで安定動作させる。
  trailingSlash: true,
};

export default nextConfig;
