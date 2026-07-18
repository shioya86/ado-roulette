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

  /**
   * @param setlistId  対象セトリ
   * @param excludeIds 除外する項目 id（例: 既に当選済みの曲）。省略時は除外なし。
   * @returns 当選項目。除外しきって候補が無ければ null。
   */
  async execute(
    setlistId: string,
    excludeIds: readonly string[] = [],
  ): Promise<RouletteItemDTO | null> {
    const setlist = await this.repository.findById(setlistId);
    if (setlist === null) {
      throw new Error(`setlist not found: ${setlistId}`);
    }

    // 「出た曲を除外する」はアプリのポリシー。ここで候補を絞り込む
    // （domain の Roulette は「渡された項目を均等に」に徹する）。
    const exclude = new Set(excludeIds);
    const candidates = setlist
      .getItems()
      .filter((item) => !exclude.has(item.id.toString()));

    if (candidates.length === 0) return null; // 候補なし

    const roulette = Roulette.create(candidates);
    const index = this.randomizer.nextIndex(roulette.size);
    const winner = roulette.pick(index);

    return toRouletteItemDTO(winner);
  }
}
