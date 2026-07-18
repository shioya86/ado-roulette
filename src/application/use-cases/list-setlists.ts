import { SetlistRepository } from "@/domain/repositories/setlist-repository";
import {
  SetlistSummaryDTO,
  toSetlistSummaryDTO,
} from "@/application/dto/setlist-summary-dto";

/**
 * ListSetlistsUseCase — 「切り替え可能なセトリ一覧を取得する」ユースケース
 *
 * セレクタ（ライブの選択）に表示するための要約リストを返す。
 */
export class ListSetlistsUseCase {
  constructor(private readonly repository: SetlistRepository) {}

  async execute(): Promise<SetlistSummaryDTO[]> {
    const setlists = await this.repository.findAll();
    return setlists.map(toSetlistSummaryDTO);
  }
}
