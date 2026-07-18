/**
 * ItemId — 値オブジェクト（Value Object）
 *
 * 項目を識別するためのID。value object の特徴:
 *   - 不変（immutable）: 一度作ったら中身を変えない
 *   - 値で等価判定する: 同じ文字列を持つ ItemId 同士は「等しい」
 *   - 生成時に不正な値を弾く（常に正しい状態でしか存在できない）
 *
 * ただの string ではなく型を作ることで、
 * 「項目ラベル」など他の string と取り違えるミスを型レベルで防げる。
 */
export class ItemId {
  private constructor(private readonly value: string) {}

  /** 正しい ItemId を生成する。空文字は許さない。 */
  static create(value: string): ItemId {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      throw new Error("ItemId must not be empty");
    }
    return new ItemId(trimmed);
  }

  /** 値で等価判定する（参照ではなく中身で比較）。 */
  equals(other: ItemId): boolean {
    return this.value === other.value;
  }

  /** 文字列表現を取り出す（保存や表示に使う）。 */
  toString(): string {
    return this.value;
  }
}
