import { Roulette } from "@/domain/entities/roulette";
import { SetlistRepository } from "@/domain/repositories/setlist-repository";
import { Randomizer } from "@/application/ports/randomizer";
import {
  RouletteItemDTO,
  toRouletteItemDTO,
} from "@/application/dto/roulette-item-dto";

/**
 * SpinRouletteUseCase — 「選択中のセトリでルーレットを回す」ユースケース
 *
 * 処理の流れ:
 *   1. setlistId でセトリ（母集団）を取得する
 *   2. その項目で Roulette（domain）を組み立てる
 *   3. Randomizer で 0〜size-1 の番号を1つ作る
 *   4. roulette.pick(番号) で当選項目を選ぶ
 *   5. DTO に変換して返す
 *
 * 依存はすべて契約（interface）で受け取る（コンストラクタ注入）。
 */
export class SpinRouletteUseCase {
  constructor(
    private readonly repository: SetlistRepository,
    private readonly randomizer: Randomizer,
  ) {}

  async execute(setlistId: string): Promise<RouletteItemDTO> {
    const setlist = await this.repository.findById(setlistId);
    if (setlist === null) {
      throw new Error(`setlist not found: ${setlistId}`);
    }

    // Roulette.create が空リストを弾くので、ここでは番号生成に集中できる。
    const roulette = Roulette.create(setlist.getItems());

    const index = this.randomizer.nextIndex(roulette.size);
    const winner = roulette.pick(index);

    return toRouletteItemDTO(winner);
  }
}
