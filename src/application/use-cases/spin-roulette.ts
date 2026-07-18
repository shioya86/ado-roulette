import { Roulette } from "@/domain/entities/roulette";
import { RouletteItemRepository } from "@/domain/repositories/roulette-item-repository";
import { Randomizer } from "@/application/ports/randomizer";
import {
  RouletteItemDTO,
  toRouletteItemDTO,
} from "@/application/dto/roulette-item-dto";

/**
 * SpinRouletteUseCase — 「ルーレットを回す」ユースケース
 *
 * 処理の流れ（アプリ固有のルール）:
 *   1. repository から項目を読み込む
 *   2. Roulette（domain）を組み立てる
 *   3. Randomizer で 0〜size-1 の番号を1つ作る
 *   4. roulette.pick(番号) で当選項目を選ぶ
 *   5. DTO に変換して返す
 *
 * 依存はすべて「契約（interface）」で受け取る（コンストラクタ注入）。
 * 具体的な実装（localStorage/Math.random）はこのクラスの外で決める。
 */
export class SpinRouletteUseCase {
  constructor(
    private readonly repository: RouletteItemRepository,
    private readonly randomizer: Randomizer,
  ) {}

  async execute(): Promise<RouletteItemDTO> {
    const items = await this.repository.findAll();

    // Roulette.create が空リストを弾くので、ここでは番号生成に集中できる。
    const roulette = Roulette.create(items);

    const index = this.randomizer.nextIndex(roulette.size);
    const winner = roulette.pick(index);

    return toRouletteItemDTO(winner);
  }
}
