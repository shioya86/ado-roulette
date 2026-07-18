import { RouletteItem } from "@/domain/entities/roulette-item";

/**
 * RouletteItemRepository — リポジトリの「契約」（インターフェース）
 *
 * domain 層は「項目を取得・保存できる」という契約だけを定義する。
 * 実際に localStorage を使うのか API を叩くのかは domain の関心事ではない。
 * この契約の具体的な実装は infrastructure 層が担う（依存性逆転の原則）。
 *
 * 非同期（Promise）にしておくことで、将来 localStorage から
 * サーバーAPIに差し替えても呼び出し側を変えずに済む。
 */
export interface RouletteItemRepository {
  /** すべての項目を取得する。 */
  findAll(): Promise<RouletteItem[]>;

  /** 項目一式を保存する（丸ごと置き換え）。 */
  save(items: readonly RouletteItem[]): Promise<void>;
}
