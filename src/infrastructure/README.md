# infrastructure 層（フレームワーク & ドライバ / 実装の詳細）

domain / application が定義した「インターフェース」の**具体的な実装**を置く層。

- domain のインターフェースを import して実装する
- 外の世界（ブラウザ API, localStorage, fetch, 外部サービス）と接するのはここだけ
- ここを差し替えても、内側（domain / application）は影響を受けない

## 置くもの

- **repositories/** … domain の repository インターフェースの実装。
  例: `LocalStoragePrizeRepository`（localStorage に保存する実装）。
- **services/** … 乱数生成・日時・外部 API クライアントなど技術的な実装。

## 依存性逆転の原則（DIP）の実感

`application` は `PrizeRepository`（インターフェース）に依存する。
`infrastructure` の `LocalStoragePrizeRepository` も同じインターフェースに依存する。
→ 両者が「抽象」を向いており、application が infrastructure を直接知らずに済む。
