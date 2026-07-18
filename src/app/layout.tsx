import type { Metadata } from "next";
import "./globals.css";

// アプリ全体で共有するメタデータ（タブのタイトルなど）
export const metadata: Metadata = {
  title: "Ado曲ルーレット",
  description: "Ado の曲をルーレットで選ぶアプリ",
};

// すべてのページを包む最上位のレイアウト。
// App Router では layout.tsx が <html> / <body> を定義します。
// ページ見出しは左上の控えめなヘッダーに置く（"ado-roulette" はリポジトリ名）。
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <h1 className="site-title">Ado曲ルーレット</h1>
        </header>
        {children}
      </body>
    </html>
  );
}
