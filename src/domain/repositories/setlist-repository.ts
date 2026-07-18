import { Setlist } from "@/domain/entities/setlist";

/**
 * SetlistRepository — リポジトリの契約（インターフェース）
 *
 * セトリ（母集団）の取得だけを定義する。どこから取得するか
 * （コード内の静的データ / API など）は infrastructure 層の関心事。
 */
export interface SetlistRepository {
  /** すべてのセトリを取得する（切り替え用の一覧に使う）。 */
  findAll(): Promise<Setlist[]>;

  /** id でセトリを1つ取得する。無ければ null。 */
  findById(id: string): Promise<Setlist | null>;
}
