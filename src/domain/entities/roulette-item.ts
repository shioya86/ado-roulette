import { ItemId } from "@/domain/value-objects/item-id";

/**
 * RouletteItem — エンティティ（Entity）
 *
 * ルーレットの1項目（例: "banana", "apple"）。
 * エンティティの特徴は「ID による同一性」。
 * ラベルが同じでも ID が違えば別物、ID が同じなら同一とみなす。
 */
export class RouletteItem {
  private constructor(
    readonly id: ItemId,
    readonly label: string,
  ) {}

  /**
   * 項目を生成する。
   * ラベルは表示用の文字列（例: "banana"）。
   */
  static create(id: string, label: string): RouletteItem {
    const trimmedLabel = label.trim();
    if (trimmedLabel.length === 0) {
      throw new Error("RouletteItem label must not be empty");
    }
    return new RouletteItem(ItemId.create(id), trimmedLabel);
  }

  /** エンティティの同一性は ID で判定する。 */
  equals(other: RouletteItem): boolean {
    return this.id.equals(other.id);
  }
}
