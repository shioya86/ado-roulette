import { RouletteItem } from "@/domain/entities/roulette-item";
import { RouletteItemRepository } from "@/domain/repositories/roulette-item-repository";

/** localStorage に保存する際の1件分の形（振る舞いを持たない平坦なデータ）。 */
interface StoredItem {
  id: string;
  label: string;
}

/**
 * 初回起動時に入れておく seed データ（Ado の代表曲）。
 * id は安定した識別子（ローマ字スラッグ）、label は表示用の曲名。
 * 将来アルバム/セトリ単位で切り替える際は、この固定リストを Song/SongSource
 * ベースのデータ源に差し替える（docs/DESIGN.md 参照）。
 */
const DEFAULT_ITEMS: StoredItem[] = [
  { id: "shinjidai", label: "新時代" },
  { id: "usseewa", label: "うっせぇわ" },
  { id: "giragira", label: "ギラギラ" },
  { id: "odo", label: "踊" },
  { id: "ashura", label: "阿修羅ちゃん" },
  { id: "saikyo", label: "私は最強" },
  { id: "gyakko", label: "逆光" },
  { id: "show", label: "唱" },
  { id: "readymade", label: "レディメイド" },
  { id: "aitakute", label: "会いたくて" },
  { id: "kurakura", label: "クラクラ" },
  { id: "himawari", label: "向日葵" },
];

/**
 * LocalStorageRouletteItemRepository — RouletteItemRepository の実装
 *
 * ブラウザの localStorage を永続化先として使う。
 * この層だけが「保存方法（localStorage）」を知っている。
 * application / domain はこの存在を知らず、契約（interface）だけを見る。
 */
export class LocalStorageRouletteItemRepository
  implements RouletteItemRepository
{
  // 保存キー。他アプリと衝突しないよう名前空間を付ける。
  // seed 内容を変えたらバージョンを上げ、旧データ（フルーツ等）を無効化する。
  private static readonly STORAGE_KEY = "ado-roulette:items:v2";

  async findAll(): Promise<RouletteItem[]> {
    const stored = this.read();

    // 未保存なら、モックデータを種として保存してから返す。
    if (stored === null) {
      await this.save(DEFAULT_ITEMS.map((i) => RouletteItem.create(i.id, i.label)));
      return DEFAULT_ITEMS.map((i) => RouletteItem.create(i.id, i.label));
    }

    // 保存済みデータを domain エンティティに復元する。
    return stored.map((i) => RouletteItem.create(i.id, i.label));
  }

  async save(items: readonly RouletteItem[]): Promise<void> {
    if (!this.isBrowser()) return;

    const data: StoredItem[] = items.map((item) => ({
      id: item.id.toString(),
      label: item.label,
    }));
    window.localStorage.setItem(
      LocalStorageRouletteItemRepository.STORAGE_KEY,
      JSON.stringify(data),
    );
  }

  /** localStorage から生データを読む。未保存や壊れたデータなら null を返す。 */
  private read(): StoredItem[] | null {
    if (!this.isBrowser()) return null;

    const raw = window.localStorage.getItem(
      LocalStorageRouletteItemRepository.STORAGE_KEY,
    );
    if (raw === null) return null;

    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      // 最低限の形チェック（id/label を持つオブジェクトだけ通す）。
      return parsed.filter(
        (v): v is StoredItem =>
          typeof v === "object" &&
          v !== null &&
          typeof (v as StoredItem).id === "string" &&
          typeof (v as StoredItem).label === "string",
      );
    } catch {
      // JSON が壊れている場合は「未保存」と同じ扱いにする。
      return null;
    }
  }

  /** localStorage が使える環境か（ビルド時のサーバー側では false）。 */
  private isBrowser(): boolean {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }
}
