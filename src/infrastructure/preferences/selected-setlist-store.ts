/**
 * selectedSetlistStore — 選択中セトリ id の永続化（localStorage）
 *
 * 「どのセトリを選んでいたか」をブラウザに覚えさせ、再訪時に復元する。
 * ブラウザ外（ビルド時）でも壊れないよう window の有無をガードする。
 */
const STORAGE_KEY = "ado-roulette:selected-setlist";

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

export const selectedSetlistStore = {
  get(): string | null {
    if (!isBrowser()) return null;
    return window.localStorage.getItem(STORAGE_KEY);
  },
  set(id: string): void {
    if (!isBrowser()) return;
    window.localStorage.setItem(STORAGE_KEY, id);
  },
};
