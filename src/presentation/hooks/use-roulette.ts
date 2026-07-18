"use client";

import { useCallback, useEffect, useState } from "react";
import { RouletteItemDTO } from "@/application/dto/roulette-item-dto";
import { SetlistSummaryDTO } from "@/application/dto/setlist-summary-dto";
import {
  listRouletteItemsUseCase,
  listSetlistsUseCase,
  spinRouletteUseCase,
} from "@/app/composition-root";
import { selectedSetlistStore } from "@/infrastructure/preferences/selected-setlist-store";

/**
 * useRoulette — ユースケースと React state をつなぐフック
 *
 * セトリ切り替えに対応:
 *   - setlists / selectedId / selectSetlist で母集団（ライブ）を選ぶ
 *   - 選択が変わると、そのセトリの項目を読み込み直す
 *
 * 回転アニメーションのために「開始」と「終了」を分ける:
 *   - startSpin(): 選択中セトリで当選項目を先に決めて返す
 *   - endSpin(): アニメーションが終わったら結果を表示する
 *
 * 業務ルール（誰が当たるか）は startSpin で確定済み。見た目・時間は
 * presentation の都合であり、domain / application には影響しない。
 */
export function useRoulette() {
  const [setlists, setSetlists] = useState<SetlistSummaryDTO[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<RouletteItemDTO[]>([]);
  const [result, setResult] = useState<RouletteItemDTO | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // 初回マウント時にセトリ一覧を読み込み、前回の選択（あれば）を復元する。
  useEffect(() => {
    listSetlistsUseCase.execute().then((list) => {
      setSetlists(list);
      const saved = selectedSetlistStore.get();
      const initial =
        list.find((s) => s.id === saved)?.id ?? list[0]?.id ?? null;
      setSelectedId(initial);
    });
  }, []);

  // 選択セトリが変わったら、その項目を読み込み直し、結果はクリアする。
  useEffect(() => {
    if (selectedId === null) return;
    listRouletteItemsUseCase.execute(selectedId).then(setItems);
    setResult(null);
  }, [selectedId]);

  /** セトリ（ライブ）を切り替える。回転中は無視。 */
  const selectSetlist = useCallback(
    (id: string) => {
      if (isSpinning) return;
      selectedSetlistStore.set(id);
      setSelectedId(id);
    },
    [isSpinning],
  );

  /** 回転開始。当選項目を確定して返す（見た目の回転は呼び出し側が担う）。 */
  const startSpin = useCallback(async (): Promise<RouletteItemDTO | null> => {
    if (isSpinning || selectedId === null || items.length === 0) return null;
    setIsSpinning(true);
    setResult(null);
    return spinRouletteUseCase.execute(selectedId);
  }, [isSpinning, selectedId, items.length]);

  /** 回転終了。結果を確定表示する。 */
  const endSpin = useCallback((winner: RouletteItemDTO) => {
    setResult(winner);
    setIsSpinning(false);
  }, []);

  return {
    setlists,
    selectedId,
    selectSetlist,
    items,
    result,
    isSpinning,
    startSpin,
    endSpin,
  };
}
