import { RouletteItem } from "@/domain/entities/roulette-item";

/**
 * RouletteItemDTO — Data Transfer Object
 *
 * 層をまたいでデータを渡すための、振る舞いを持たない単純な型。
 * domain の RouletteItem（メソッドや不変条件を持つ）をそのまま
 * presentation に渡すと結合が強くなるため、境界で平坦な形に変換する。
 */
export interface RouletteItemDTO {
  readonly id: string;
  readonly label: string;
}

/** domain エンティティ → DTO への変換。 */
export function toRouletteItemDTO(item: RouletteItem): RouletteItemDTO {
  return {
    id: item.id.toString(),
    label: item.label,
  };
}
