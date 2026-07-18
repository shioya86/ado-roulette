# application 層（ユースケース / アプリケーションビジネスルール）

「このアプリで何ができるか」を表現する層。domain を使って**操作の流れ**を組み立てる。

- domain 層にのみ依存する（外側の infrastructure / presentation は知らない）
- 1ユースケース = 1つの「アプリが提供する操作」

## 置くもの

- **use-cases/** … 例: `SpinWheelUseCase`（ルーレットを回す）,
  `AddPrizeUseCase`（賞を追加する）。
  入力を受け取り、domain のルールを適用し、結果を返す。
- **dto/** … 層をまたいでデータを受け渡すための単純な型（Data Transfer Object）。
- **ports/** … 外部サービスに求める追加のインターフェース（必要な場合）。

## ポイント

ユースケースは repository の「インターフェース」を受け取って動く（コンストラクタ注入）。
具体的な実装は外側（infrastructure）から渡される。
これによりテスト時はモック実装を差し込める。
