import { RouletteItem } from "@/domain/entities/roulette-item";
import { Setlist } from "@/domain/entities/setlist";
import { SetlistRepository } from "@/domain/repositories/setlist-repository";

/** コード内に持つセトリの元データ（曲名の並び）。 */
interface SetlistData {
  id: string;
  name: string;
  songs: string[];
}

/**
 * セトリの元データ。
 *   - "人気曲" は代表曲の汎用リスト。
 *   - 他は Ado の実在ツアーのセトリ（Ado 自身の楽曲に絞った抜粋）。
 * 曲の追加・セトリの追加はこの配列を編集する。
 * （出典: 各ライブのセトリまとめ。カバー曲は除外し、曲数は盤面向けに抜粋）
 */
const SETLISTS: SetlistData[] = [
  {
    id: "popular",
    name: "人気曲",
    songs: [
      "新時代",
      "うっせぇわ",
      "ギラギラ",
      "踊",
      "阿修羅ちゃん",
      "私は最強",
      "逆光",
      "唱",
      "レディメイド",
      "会いたくて",
      "クラクラ",
      "向日葵",
    ],
  },
  {
    id: "shinkiro",
    name: "蜃気楼 (2022–2023)",
    songs: [
      "うっせぇわ",
      "ウタカタララバイ",
      "私は最強",
      "ギラギラ",
      "金木犀",
      "イート",
      "過学習",
      "リベリオン",
      "行方知れず",
      "ラッキー・ブルート",
      "Tot Musica",
      "世界のつづき",
      "風のゆくえ",
      "心という名の不可解",
    ],
  },
  {
    id: "mars",
    name: "マーズ (2023)",
    songs: [
      "踊",
      "私は最強",
      "FREEDOM",
      "阿修羅ちゃん",
      "レディメイド",
      "行方知れず",
      "花火",
      "向日葵",
      "リベリオン",
      "私は問題作",
      "Tot Musica",
      "うっせぇわ",
      "DIGNITY",
      "逆光",
      "唱",
      "新時代",
    ],
  },
];

/**
 * StaticSetlistRepository — SetlistRepository の実装
 *
 * セトリをコード内の静的データとして提供する（参照データなので DB は不要）。
 * 将来 API 等に差し替える場合も、この層だけを替えれば内側は無変更。
 */
export class StaticSetlistRepository implements SetlistRepository {
  async findAll(): Promise<Setlist[]> {
    return SETLISTS.map(toSetlist);
  }

  async findById(id: string): Promise<Setlist | null> {
    const data = SETLISTS.find((s) => s.id === id);
    return data ? toSetlist(data) : null;
  }
}

/** 元データ → domain の Setlist へ変換する。 */
function toSetlist(data: SetlistData): Setlist {
  const items = data.songs.map((title, i) =>
    // id は「セトリ内で一意」なら十分。同名曲が別セトリにあっても衝突しない。
    RouletteItem.create(`${data.id}-${i}`, title),
  );
  return Setlist.create(data.id, data.name, items);
}
