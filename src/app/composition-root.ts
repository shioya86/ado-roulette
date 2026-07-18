import { SpinRouletteUseCase } from "@/application/use-cases/spin-roulette";
import { ListRouletteItemsUseCase } from "@/application/use-cases/list-roulette-items";
import { ListSetlistsUseCase } from "@/application/use-cases/list-setlists";
import { StaticSetlistRepository } from "@/infrastructure/repositories/static-setlist-repository";
import { MathRandomizer } from "@/infrastructure/services/math-randomizer";

/**
 * Composition Root — 依存の配線を行う唯一の場所
 *
 * 「どの契約に、どの実装を注入するか」をここで決める。
 * ここだけが infrastructure（具体実装）と application（ユースケース）の
 * 両方を import してよい。
 */

// 具体的な実装を1度だけ生成する。
const setlistRepository = new StaticSetlistRepository();
const randomizer = new MathRandomizer();

// ユースケースに実装を注入して組み立てる。
export const spinRouletteUseCase = new SpinRouletteUseCase(
  setlistRepository,
  randomizer,
);
export const listRouletteItemsUseCase = new ListRouletteItemsUseCase(
  setlistRepository,
);
export const listSetlistsUseCase = new ListSetlistsUseCase(setlistRepository);
