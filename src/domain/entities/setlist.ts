import { RouletteItem } from "@/domain/entities/roulette-item";

/**
 * Setlist — エンティティ（SongSource の具体形）
 *
 * 「名前付きの曲コレクション」。Ado の各ライブのセトリや、
 * 代表曲リストなど、ルーレットの母集団を1つ表す。
 *
 * DESIGN 4.5 の「母集団を提供するもの」を、この app の必要範囲に絞って実装したもの。
 * ルーレットは項目（RouletteItem）だけを必要とするため、Setlist は
 * 「名前 + 項目の並び」を持つ最小構成にしている。
 */
export class Setlist {
  private constructor(
    readonly id: string,
    readonly name: string,
    private readonly items: readonly RouletteItem[],
  ) {}

  /** id・名前・1件以上の項目がある状態でのみ生成できる。 */
  static create(
    id: string,
    name: string,
    items: readonly RouletteItem[],
  ): Setlist {
    if (id.trim().length === 0) {
      throw new Error("Setlist id must not be empty");
    }
    if (name.trim().length === 0) {
      throw new Error("Setlist name must not be empty");
    }
    if (items.length === 0) {
      throw new Error("Setlist must have at least one item");
    }
    return new Setlist(id.trim(), name.trim(), items);
  }

  /** 収録項目（表示・抽選に使う）。 */
  getItems(): readonly RouletteItem[] {
    return this.items;
  }

  /** 項目数。 */
  get size(): number {
    return this.items.length;
  }
}
