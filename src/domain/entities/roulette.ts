import { RouletteItem } from "@/domain/entities/roulette-item";

/**
 * Roulette — 集約（Aggregate）
 *
 * 複数の RouletteItem をまとめた「ルーレット盤」。
 *
 * 重要な設計判断:
 *   このクラスは Math.random を一切使わない。
 *   「どの番号を引くか」という乱数は外側（use case / infrastructure）の責務。
 *   Roulette は「番号を渡されたら、その項目を返す」純粋なロジックだけを持つ。
 *   → domain が技術的詳細（乱数）に依存しないので、テストが安定＆簡単になる。
 */
export class Roulette {
  private constructor(private readonly items: readonly RouletteItem[]) {}

  /** 少なくとも1項目ある状態でのみ生成できる（空のルーレットは回せない）。 */
  static create(items: readonly RouletteItem[]): Roulette {
    if (items.length === 0) {
      throw new Error("Roulette must have at least one item");
    }
    return new Roulette(items);
  }

  /** 項目数。use case が「0〜size-1」の乱数を作るために使う。 */
  get size(): number {
    return this.items.length;
  }

  /** 全項目を取得する（表示用）。 */
  getItems(): readonly RouletteItem[] {
    return this.items;
  }

  /**
   * 指定した番号の項目を選ぶ。均等確率での抽選は、
   * 「0〜size-1 の一様乱数を外で作って、この番号を渡す」ことで実現する。
   */
  pick(index: number): RouletteItem {
    if (!Number.isInteger(index) || index < 0 || index >= this.items.length) {
      throw new Error(
        `pick index out of range: ${index} (size=${this.items.length})`,
      );
    }
    return this.items[index];
  }
}
