import type { Metadata } from "next";
import "./globals.css";

// アプリ全体で共有するメタデータ（タブのタイトルなど）
export const metadata: Metadata = {
  title: "ado-roulette",
  description: "A Next.js app deployed to GitHub Pages",
};

// すべてのページを包む最上位のレイアウト。
// App Router では layout.tsx が <html> / <body> を定義します。
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
