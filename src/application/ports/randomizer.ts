/**
 * Randomizer — ポート（application が外部に求める契約）
 *
 * 「0 以上 size 未満の整数を1つ選ぶ」だけの抽象。
 * 均等（一様）に選ぶ責務はこの契約の実装側が負う。
 *
 * なぜ interface にするのか:
 *   - 本番は Math.random ベースの実装を注入する
 *   - テストや開発では「常に 0 を返す」固定実装を注入して結果を予測可能にできる
 *   → application / domain は Math.random を直接知らずに済む（依存性逆転）。
 */
export interface Randomizer {
  /**
   * 0 以上 size 未満の整数を返す。
   * @param size 候補数（1 以上）
   */
  nextIndex(size: number): number;
}
