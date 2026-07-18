import { RouletteItemRepository } from "@/domain/repositories/roulette-item-repository";
import {
  RouletteItemDTO,
  toRouletteItemDTO,
} from "@/application/dto/roulette-item-dto";

/**
 * ListRouletteItemsUseCase — 「全項目を取得する」ユースケース
 *
 * ルーレット盤を画面に描くために、現在の項目一覧を DTO で返す。
 * 回す操作（SpinRouletteUseCase）とは責務が別なので、ユースケースを分ける。
 */
export class ListRouletteItemsUseCase {
  constructor(private readonly repository: RouletteItemRepository) {}

  async execute(): Promise<RouletteItemDTO[]> {
    const items = await this.repository.findAll();
    return items.map(toRouletteItemDTO);
  }
}
