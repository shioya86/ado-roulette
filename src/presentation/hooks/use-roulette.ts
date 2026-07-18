"use client";

import { useCallback, useEffect, useState } from "react";
import { RouletteItemDTO } from "@/application/dto/roulette-item-dto";
import {
  listRouletteItemsUseCase,
  spinRouletteUseCase,
} from "@/app/composition-root";

/**
 * useRoulette — ユースケースと React state をつなぐフック
 *
 * 回転アニメーションのために「開始」と「終了」を分ける:
 *   - startSpin(): ユースケースで当選項目を先に決めて返す。
 *     presentation はこの当選位置に向けて盤を回す（＝止まる位置の計算に使う）。
 *   - endSpin(): アニメーションが終わったら結果を表示する。
 *
 * 注意: 業務ルール（誰が当たるか）は startSpin で確定済み。
 * アニメーションの見た目・時間は presentation の都合であり、
 * domain / application には一切影響しない。
 */
export function useRoulette() {
  const [items, setItems] = useState<RouletteItemDTO[]>([]);
  const [result, setResult] = useState<RouletteItemDTO | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // 初回マウント時に項目一覧を読み込む（localStorage はブラウザでのみ動くため）。
  useEffect(() => {
    listRouletteItemsUseCase.execute().then(setItems);
  }, []);

  /** 回転開始。当選項目を確定して返す（見た目の回転は呼び出し側が担う）。 */
  const startSpin = useCallback(async (): Promise<RouletteItemDTO | null> => {
    if (isSpinning || items.length === 0) return null;
    setIsSpinning(true);
    setResult(null);
    return spinRouletteUseCase.execute();
  }, [isSpinning, items.length]);

  /** 回転終了。結果を確定表示する。 */
  const endSpin = useCallback((winner: RouletteItemDTO) => {
    setResult(winner);
    setIsSpinning(false);
  }, []);

  return { items, result, isSpinning, startSpin, endSpin };
}
