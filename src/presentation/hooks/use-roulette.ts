"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
 * セトリ切り替え + カラオケ向けの「当選履歴 / 被りなし抽選 / リセット」に対応。
 *   - history: これまでに当選した項目（出た順）
 *   - remaining: まだ出ていない項目
 *   - startSpin(excludeDrawn): 被りなしなら history を除外して当選を決める
 *   - resetHistory(): 履歴（＝除外）をクリア
 *
 * 業務ルール（誰が当たるか・除外）は application 側で確定。見た目・時間は
 * presentation の都合であり、domain には影響しない。
 */
export function useRoulette() {
  const [setlists, setSetlists] = useState<SetlistSummaryDTO[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [items, setItems] = useState<RouletteItemDTO[]>([]);
  const [result, setResult] = useState<RouletteItemDTO | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [history, setHistory] = useState<RouletteItemDTO[]>([]);

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

  // 選択セトリが変わったら、項目を読み直し、結果と履歴もリセットする（新しい回）。
  useEffect(() => {
    if (selectedId === null) return;
    listRouletteItemsUseCase.execute(selectedId).then(setItems);
    setResult(null);
    setHistory([]);
  }, [selectedId]);

  // 出た曲の id 集合と、まだ出ていない項目。
  const drawnIds = useMemo(
    () => new Set(history.map((h) => h.id)),
    [history],
  );
  const remaining = useMemo(
    () => items.filter((i) => !drawnIds.has(i.id)),
    [items, drawnIds],
  );

  /** セトリ（ライブ）を切り替える。回転中は無視。 */
  const selectSetlist = useCallback(
    (id: string) => {
      if (isSpinning) return;
      selectedSetlistStore.set(id);
      setSelectedId(id);
    },
    [isSpinning],
  );

  /**
   * 回転開始。当選項目を確定して返す（見た目の回転は呼び出し側が担う）。
   * excludeDrawn=true なら、既に出た曲を除外して抽選する。
   * 候補が無い場合は null。
   */
  const startSpin = useCallback(
    async (excludeDrawn: boolean): Promise<RouletteItemDTO | null> => {
      if (isSpinning || selectedId === null || items.length === 0) return null;
      if (excludeDrawn && remaining.length === 0) return null;

      const excludeIds = excludeDrawn ? history.map((h) => h.id) : [];
      setIsSpinning(true);
      setResult(null);
      return spinRouletteUseCase.execute(selectedId, excludeIds);
    },
    [isSpinning, selectedId, items.length, remaining.length, history],
  );

  /** 回転終了。結果を確定表示し、履歴に記録する。 */
  const endSpin = useCallback((winner: RouletteItemDTO) => {
    setResult(winner);
    setHistory((prev) => [...prev, winner]);
    setIsSpinning(false);
  }, []);

  /** 当選履歴（＝除外）をクリアする。回転中は無視。 */
  const resetHistory = useCallback(() => {
    if (isSpinning) return;
    setHistory([]);
    setResult(null);
  }, [isSpinning]);

  return {
    setlists,
    selectedId,
    selectSetlist,
    items,
    result,
    isSpinning,
    history,
    drawnIds,
    remaining,
    startSpin,
    endSpin,
    resetHistory,
  };
}
