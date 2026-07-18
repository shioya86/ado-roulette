# ado-roulette

くじ引き / 抽選のための汎用ルーレットアプリ。項目を**均等な確率**で1つ選ぶ。
回転する円盤で当選項目を演出（回転中のライブ表示・当選時の紙吹雪・発光）する。

現在の項目はモックのフルーツ（banana, apple, …）。最終的には **Ado の曲名**を、
アルバムやライブのセトリ単位で切り替えられるようにする想定（→ [DESIGN](docs/DESIGN.md)）。

- **公開先**: https://shioya86.github.io/ado-roulette/
- **技術**: Next.js 15 (App Router) / React 19 / TypeScript、静的エクスポートで GitHub Pages にデプロイ
- **設計**: クリーンアーキテクチャ（詳細は [docs/DESIGN.md](docs/DESIGN.md)）

---

## 開発

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # 静的エクスポート → out/ に出力
```

`npm run build` の出力 `out/` がそのまま GitHub Pages に載る静的サイト。

---

## デプロイの仕組み

- `main` への push で `.github/workflows/deploy.yml` が走り、ビルドして Pages に公開する。
- **反映するには `main` へのマージが必要**（作業ブランチに push しただけでは公開されない）。
- リポジトリの **Settings → Pages → Source は「GitHub Actions」**にしておくこと。

---

## ディレクトリ構成

```
src/
├── domain/          ① 純粋なロジック（技術を知らない）: エンティティ・値オブジェクト・repository契約
├── application/     ② ユースケース（domainだけに依存）: 操作の流れ・ポート・DTO
├── infrastructure/  ③ 契約の実装（外部に触れる唯一の層）: localStorage・乱数
├── presentation/    ④ 表示（React）: フック・コンポーネント
└── app/             Next.jsの入り口 + composition-root（依存の配線）
```

各層の責務は `src/<層>/README.md` に、設計判断は [docs/DESIGN.md](docs/DESIGN.md) に記載。

---

## メンテナンスで重要な点

### アーキテクチャの鉄則
- **依存は「外 → 内」だけ**。`domain` は何も import しない。`application` は `domain` のみ。
  内側から外側（React / localStorage / 具体実装）を import しないこと。
- **UI や演出（アニメ・紙吹雪など）の変更は `presentation` 層で完結させる**。
  抽選ロジック（domain / application）には触れない。
- **実装の差し替え（保存先・乱数）は `src/app/composition-root.ts` の1箇所だけ**を変える。
  新しい repository / randomizer を作って、ここで注入し替える。

### 項目データを変えるとき（例: フルーツ → 曲名）
- 当面は `src/infrastructure/repositories/local-storage-roulette-item-repository.ts` の
  `DEFAULT_ITEMS` を書き換える（初回シードデータ）。
- localStorage に**古いデータが残る**点に注意。保存キーは `ado-roulette:items`。
  データ構造を変えたら、キーにバージョンを付ける等で旧データを無効化すること。
- アルバム / セトリ単位の切り替えを入れる場合は、`Song` / `SongSource` を追加する設計
  （[DESIGN 4.5](docs/DESIGN.md)）に従う。

### GitHub Pages（静的エクスポート）の制約
- **サーバー機能は使えない**（API Routes / SSR / `next/image` の最適化）。`images.unoptimized` 必須。
- **リポジトリ名を変えたら** `next.config.ts` の `repoName` も必ず合わせる（`basePath` がずれると 404）。
- `public/.nojekyll` は消さない（`_next/` が Jekyll に無視されるのを防ぐ）。
- ブラウザ専用 API（localStorage 等）を使うコードは、ビルド時に壊れないよう
  `typeof window !== "undefined"` でガードする。

### アクセシビリティ
- 演出は `prefers-reduced-motion` を尊重する（回転抑制・紙吹雪オフ）。新しい演出でも守ること。
