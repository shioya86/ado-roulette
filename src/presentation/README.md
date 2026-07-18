# presentation 層（最外層 / UI）

ユーザーに見える部分。React コンポーネントや表示ロジックを置く。

- application 層のユースケースを呼び出す
- ここでは「見た目」と「ユーザー操作の受け渡し」に専念する
- 業務ルールを書かない（それは domain / application の仕事）

## Next.js App Router との関係

- ルーティングの実体（page.tsx / layout.tsx）は Next.js の制約で `src/app/` に置く。
  `src/app/` は「ルートの入り口」だけを担い、実際の UI 部品はこの層に切り出す。
- **components/** … 再利用可能な React コンポーネント。
- **hooks/** … ユースケースと UI をつなぐ React フック。

## 依存の組み立て（Composition Root）

「どの実装を注入するか」を決める配線は最外層で行う。
Next.js アプリでは `src/app/` 側、または専用の DI モジュールで
infrastructure の実装を application に注入する。
