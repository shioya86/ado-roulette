# ado-roulette

くじ引き / 抽選のための汎用ルーレットアプリ。項目を**均等な確率**で1つ選ぶ。
回転する円盤で当選項目を演出（回転中のライブ表示・当選時の紙吹雪・発光）する。

カラオケでセトリを歌い合う用途を想定し、**ライブ（セトリ）の切り替え**、
**当選履歴**に対応。既定では**出た曲は盤面から消えていき**（重複なし）、全曲出たら
「全曲出ました」を表示。**リセット**で戻せるほか、**「被りを許可」**で全曲を残したまま
重複ありで回すこともできる。

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

### セトリ（曲リスト）を変えるとき
- 曲やセトリの追加・編集は
  `src/infrastructure/repositories/static-setlist-repository.ts` の `SETLISTS` 配列を編集する。
  1セトリ = `{ id, name, songs: [...] }`。`id` はセトリ間で一意にすること。
- ルーレット上部のセレクタでセトリ（ライブ）を切り替えられる。選択は
  localStorage（キー `ado-roulette:selected-setlist`）に保存され、再訪時に復元される。
- セトリは `Setlist`（= DESIGN 4.5 の SongSource）として domain にモデル化されている。
  データ源を API 等に替える場合は `SetlistRepository` の実装だけ差し替える
  （内側の抽選ロジックは無変更）。

### GitHub Pages（静的エクスポート）の制約
- **サーバー機能は使えない**（API Routes / SSR / `next/image` の最適化）。`images.unoptimized` 必須。
- **リポジトリ名を変えたら** `next.config.ts` の `repoName` も必ず合わせる（`basePath` がずれると 404）。
- `public/.nojekyll` は消さない（`_next/` が Jekyll に無視されるのを防ぐ）。
- ブラウザ専用 API（localStorage 等）を使うコードは、ビルド時に壊れないよう
  `typeof window !== "undefined"` でガードする。

### アクセシビリティ
- 演出は `prefers-reduced-motion` を尊重する（回転抑制・紙吹雪オフ）。新しい演出でも守ること。
