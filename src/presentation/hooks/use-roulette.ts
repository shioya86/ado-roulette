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
 * presentation 層の責務は「表示」と「操作の受け渡し」。
 * ここでは業務ルールを書かず、ユースケースを呼んで結果を state に反映するだけ。
 */
export function useRoulette() {
  const [items, setItems] = useState<RouletteItemDTO[]>([]);
  const [result, setResult] = useState<RouletteItemDTO | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // 初回マウント時に項目一覧を読み込む（localStorage はブラウザでのみ動くため）。
  useEffect(() => {
    listRouletteItemsUseCase.execute().then(setItems);
  }, []);

  // ルーレットを回す。少し「回っている」演出を挟んでから結果を確定する。
  const spin = useCallback(async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const winner = await spinRouletteUseCase.execute();

    // 演出用の短いウェイト（抽選ロジックとは無関係の見た目だけの都合）。
    await new Promise((resolve) => setTimeout(resolve, 800));

    setResult(winner);
    setIsSpinning(false);
  }, [isSpinning]);

  return { items, result, isSpinning, spin };
}
