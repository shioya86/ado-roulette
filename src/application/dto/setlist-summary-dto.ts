import { Setlist } from "@/domain/entities/setlist";

/**
 * SetlistSummaryDTO — セトリ切り替え UI 用の軽量な要約。
 * 中身の項目までは持たず、選択肢の表示に必要な情報だけを渡す。
 */
export interface SetlistSummaryDTO {
  readonly id: string;
  readonly name: string;
  readonly count: number;
}

/** domain の Setlist → 要約 DTO への変換。 */
export function toSetlistSummaryDTO(setlist: Setlist): SetlistSummaryDTO {
  return {
    id: setlist.id,
    name: setlist.name,
    count: setlist.size,
  };
}
