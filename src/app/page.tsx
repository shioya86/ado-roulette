import { RouletteBoard } from "@/presentation/components/roulette-board";

// トップページ（ルート "/"）。
// presentation 層の部品を配置するだけ。配線は composition-root が担当。
export default function Home() {
  return (
    <main>
      <h1>ado-roulette</h1>
      <RouletteBoard />
    </main>
  );
}
