import { RouletteItem } from "@/domain/entities/roulette-item";
import { RouletteItemRepository } from "@/domain/repositories/roulette-item-repository";

/** localStorage に保存する際の1件分の形（振る舞いを持たない平坦なデータ）。 */
interface StoredItem {
  id: string;
  label: string;
}

/**
 * 初回起動時に入れておくモックデータ（フルーツ）。
 * 将来は Ado の曲名や、アルバム/セトリ由来の曲リストに差し替える。
 */
const DEFAULT_ITEMS: StoredItem[] = [
  { id: "banana", label: "banana" },
  { id: "apple", label: "apple" },
  { id: "cherry", label: "cherry" },
  { id: "grape", label: "grape" },
  { id: "orange", label: "orange" },
  { id: "melon", label: "melon" },
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
  private static readonly STORAGE_KEY = "ado-roulette:items";

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
