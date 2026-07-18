import { SetlistRepository } from "@/domain/repositories/setlist-repository";
import {
  RouletteItemDTO,
  toRouletteItemDTO,
} from "@/application/dto/roulette-item-dto";

/**
 * ListRouletteItemsUseCase — 「選択中のセトリの項目一覧を取得する」ユースケース
 *
 * ルーレット盤を描くために、指定セトリの項目を DTO で返す。
 * セトリが見つからなければ空配列。
 */
export class ListRouletteItemsUseCase {
  constructor(private readonly repository: SetlistRepository) {}

  async execute(setlistId: string): Promise<RouletteItemDTO[]> {
    const setlist = await this.repository.findById(setlistId);
    if (setlist === null) return [];
    return setlist.getItems().map(toRouletteItemDTO);
  }
}
