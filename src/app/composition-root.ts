import { SpinRouletteUseCase } from "@/application/use-cases/spin-roulette";
import { ListRouletteItemsUseCase } from "@/application/use-cases/list-roulette-items";
import { LocalStorageRouletteItemRepository } from "@/infrastructure/repositories/local-storage-roulette-item-repository";
import { MathRandomizer } from "@/infrastructure/services/math-randomizer";

/**
 * Composition Root — 依存の配線を行う唯一の場所
 *
 * 「どの契約に、どの実装を注入するか」をここで決める。
 * ここだけが infrastructure（具体実装）と application（ユースケース）の
 * 両方を import してよい。他の場所は具体実装を知らない。
 *
 * 実装を差し替えたくなったら（例: localStorage → API、Math乱数 → 固定乱数）、
 * 変更するのはこのファイルだけで済む。
 */

// 具体的な実装を1度だけ生成する。
const repository = new LocalStorageRouletteItemRepository();
const randomizer = new MathRandomizer();

// ユースケースに実装を注入して組み立てる。
export const spinRouletteUseCase = new SpinRouletteUseCase(
  repository,
  randomizer,
);
export const listRouletteItemsUseCase = new ListRouletteItemsUseCase(
  repository,
);
