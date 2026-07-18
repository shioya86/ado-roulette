import { RouletteWheel } from "@/presentation/components/roulette-wheel";

// トップページ（ルート "/"）。
// presentation 層の部品を配置するだけ。配線は composition-root が担当。
export default function Home() {
  return (
    <main>
      <h1>ado-roulette</h1>
      <RouletteWheel />
    </main>
  );
}
