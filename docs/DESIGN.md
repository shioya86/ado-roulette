# 設計ドキュメント (DESIGN)

ado-roulette の設計判断と開発の経緯をまとめる。日々の使い方は
[README](../README.md) を、ここでは「なぜこの形になっているか」を記す。

---

## 1. このアプリの目的

くじ引き / 抽選のための汎用ルーレット。項目を均等な確率で1つ選ぶ。
現在の項目はモックのフルーツだが、最終的には **Ado の曲名**（アルバムやライブの
セトリ単位で内容を切り替え可能）にする想定で設計している。

学習目的として **クリーンアーキテクチャ** で構成している。

---

## 2. アーキテクチャの全体像

依存は常に「外 → 内」の一方向。内側は外側を一切知らない。

```
presentation → application → domain
        ┌──────────────────────────────┐
infrastructure ─(契約を実装)→ domain / application
```

| 層 | 責務 | 依存してよい相手 | 技術的詳細 |
|----|------|------------------|-----------|
| **domain** | 業務の概念・ルール | なし（純粋 TS） | 何も知らない |
| **application** | ユースケース（操作の流れ） | domain | 知らない |
| **infrastructure** | 契約の実装（保存・乱数） | domain / application | localStorage / Math.random |
| **presentation** | 表示・操作の受け渡し | application | React / Next.js |
| **app**（配線） | どの実装を注入するか決める | 全部 | Composition Root |

各層の詳細な役割は `src/<層>/README.md` に記載している。

---

## 3. 開発の経緯（コミットごと）

| コミット | 内容 | ねらい |
|----------|------|--------|
| `Scaffold Next.js app…` | Next.js 15 + TS の土台、GitHub Pages 用の静的エクスポート設定、Actions ワークフロー、各層の空ディレクトリと README | 動くデプロイ基盤とクリーンアーキテクチャの骨組み |
| `Add domain layer…` | `ItemId`（値オブジェクト）、`RouletteItem`（エンティティ）、`Roulette`（集約）、`RouletteItemRepository`（契約） | **技術を知らない純粋なロジック**として抽選の中心を定義 |
| `Add application layer…` | `Randomizer`（ポート）、`RouletteItemDTO`、`SpinRouletteUseCase` / `ListRouletteItemsUseCase` | ユースケースを組み立て、乱数と保存を「契約」で受け取る形にした |
| `Add infrastructure layer…` | `MathRandomizer`、`LocalStorageRouletteItemRepository`（モックのフルーツをシード） | 契約の**具体実装**。localStorage と Math.random をこの層に隔離 |
| `Add presentation layer…` | `composition-root`、`useRoulette` フック、`RouletteBoard`、`page.tsx` | 全層を配線して初めて画面で動く状態に |
| `Add spinning wheel animation…` | 静的リストを回転する円盤（conic-gradient + ポインタ）に置換。当選セクターが真上で止まるよう回転角を計算 | 見た目の演出。**presentation のみ変更** |
| `Show the item currently under the pointer…` | 回転中の実際の角度を毎フレーム読み、ポインタ直下の項目をライブ表示 | 実況表示。**presentation のみ変更** |
| `Add win effects…` | 紙吹雪・当選の発光・結果ポップ、および効果音（後に削除） | 演出強化。**presentation のみ変更** |
| （効果音の削除） | 効果音・ファンファーレ・ミュートボタンと `useSound` を削除。紙吹雪・発光・ポップは維持 | 好みに合わせて音を除去。視覚演出は残す |
| デザイン調整 | 青アクセント → 太い縁の撤去とモダン化 → カラフル配色 + 矢印の位置修正 → セクター内ランダム停止 → ラベルを常に正立表示 | 見た目・停止挙動の調整。**presentation のみ変更** |
| モックの曲を実データ化 | seed をフルーツ → Ado の代表曲に置換 | infrastructure のデータ差し替え |
| セトリ切り替え（4.5 の実装） | `Setlist`（SongSource）と `SetlistRepository` を追加。ライブ単位でルーレットの母集団を切り替え、選択を localStorage で保持 | domain/application/infrastructure/presentation にまたがる機能追加 |
| ライブ追加 | カムパネルラ/蜃気楼/マーズ/Wish/よだか/Ao の実在セトリ抜粋を投入 | infrastructure のデータ追加のみ |
| カラオケ向け機能 | 当選履歴・履歴リセット。除外は `SpinRouletteUseCase` の `excludeIds` で実現し、履歴は presentation state | application に除外ポリシー、presentation に履歴 UI |
| 出た曲を盤から消す | 盤に描くのを `displayItems`（既定＝未当選のみ）に変更。当選するとセクターが減る。全曲出たらオーバーレイ表示。「被りを許可」トグルで全曲表示＋重複ありに切替 | presentation のみ変更（`Roulette`/use case は無変更） |

**要点**: 円盤アニメ・ライブ表示・紙吹雪・音の追加/削除は、すべて
`presentation` 層の中だけで完結し、`domain` / `application` / `infrastructure`
には一度も触れていない。これがレイヤー分割の効果である。

---

## 4. ドメインモデリングで重要な判断

### 4.1 乱数を domain に入れない

`Roulette` は `Math.random` を持たない。`pick(index)` として
「番号を渡されたらその項目を返す」純粋なロジックに徹する。

- **どの番号を引くか**（＝均等な乱数）は `Randomizer` ポートの責務。
- こうすると domain が技術（乱数）に依存せず、テストが決定的になる。
- 「均等確率」というルールは `Randomizer` の実装（`MathRandomizer`）に閉じる。

### 4.2 契約（interface）を内側に、実装を外側に置く（依存性逆転 / DIP）

`RouletteItemRepository` や `Randomizer` は **interface だけ**を内側（domain /
application）に置き、実装（localStorage / Math.random）は外側（infrastructure）に
置く。呼び出し側は契約しか見ないので、保存先を localStorage → API に替えても
内側は無変更で済む。

### 4.3 DTO で層の境界を切る

domain の `RouletteItem`（メソッドや不変条件を持つ）を UI に直接渡さず、
`RouletteItemDTO`（平坦なデータ）に変換して渡す。内側の変更が presentation に
波及しにくくなる。

### 4.4 依存の配線は最外層に集約する（Composition Root）

「どの契約にどの実装を注入するか」は `src/app/composition-root.ts` の1箇所だけで
決める。実装を差し替えたくなったら、変更するのはここだけ。

### 4.5 【将来】曲・アルバム・セトリの持ち方

最終的に項目を Ado の曲名にし、「このアルバムの曲」「このライブのセトリ」で
ルーレット内容を切り替えたい。その際のモデリング指針:

- **所属は曲の属性にしない**。同じ曲はアルバムにも複数のセトリにも登場する
  （＝多対多）。`Song.album = "..."` にすると表現できず破綻する。
- 曲の**同一性（identity）は所属と無関係**。`Song` は `SongId` / `title` / `artist`
  など**その曲固有の属性だけ**を持つ。
- アルバム / セトリは「**母集団を提供するもの**」として抽象化する。共通の契約
  `SongSource { getSongIds(): SongId[] }` で束ねると、ルーレットを組む側は
  album か setlist かを気にせずに済み、新しい種類を足しても抽選側は無変更。
- **Roulette エンジンは汎用のまま**保つ。`Song → RouletteItem`（label = title）への
  変換は application 層の仕事にする。同じエンジンでフルーツも曲も回せる。
- 最初は1つの `SongCollection`（`kind: 'album' | 'setlist' | 'custom'`）で始め、
  固有メタデータ（アルバム=発売日 / セトリ=会場・日付）や固有の振る舞いが本当に
  必要になった時点で `Album` / `Setlist` に分ける（YAGNI）。
- **順序**は配列で保持（表示に使える。均等抽選自体は順序に無関係）。
- **重複**（セトリのアンコール等）を均等確率でどう扱うかは application の
  ポリシーとして決める（`Roulette` は「渡された項目を均等に」に徹する）。

この方針なら、曲対応は主に **infrastructure（データ源）と domain（`Song` 等の追加）の
差分**で入り、`Roulette` の抽選エンジンや UI の骨格は変えずに済む。

### 4.5.1 実装（現状）

上記のうち **セトリ切り替え**を、この app の必要範囲に絞って実装済み:

- `Setlist`（domain エンティティ）= 「名前付きの曲コレクション」= SongSource の具体形。
  ルーレットは項目しか必要としないため、`Setlist` は「名前 + `RouletteItem` の並び」の
  最小構成にしている（グローバルな `Song` 台帳は今の要件では不要なので導入していない）。
- `SetlistRepository`（契約）→ `StaticSetlistRepository`（コード内の静的データ）で実装。
  ライブのセトリはコードに直書き（参照データなので DB 不要）。
- `SpinRouletteUseCase` / `ListRouletteItemsUseCase` は `setlistId` を受け取り、
  選択中セトリの項目で動く。`ListSetlistsUseCase` が切り替え用の一覧を返す。
- 選択中セトリ id は `selectedSetlistStore`（localStorage）で永続化。
- **`Roulette` エンジンと UI の骨格は無変更**のまま、母集団の切り替えだけを足せた。

`Album` や `Song` 台帳への拡張が必要になったら、`SetlistRepository` の実装差し替え、
または `SongSource` インターフェースの一般化で対応する（YAGNI で今は未導入）。

---

## 5. GitHub Pages（静的エクスポート）に由来する制約

- `next.config.ts` で `output: 'export'`（静的 HTML を出力）。サーバー機能
  （API Routes / SSR / 画像最適化）は使えない。
- プロジェクトサイトは `/<repo>` 配下で配信されるため `basePath` / `assetPrefix` を
  リポジトリ名に合わせる（本番ビルド時のみ付与）。
- `_next/` を Jekyll に無視されないよう `public/.nojekyll` を置く。
- localStorage はブラウザにしか無い。ビルド時（サーバー側）に触れて壊れないよう、
  repository 実装は `isBrowser()` でガードする。
