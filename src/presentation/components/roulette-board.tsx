"use client";

import { useRoulette } from "@/presentation/hooks/use-roulette";
import styles from "./roulette-board.module.css";

/**
 * RouletteBoard — ルーレットの表示部品
 *
 * useRoulette フックから状態と操作を受け取り、描画するだけ。
 * 業務ルールや乱数・保存の知識はここには無い（すべて内側の層が持つ）。
 */
export function RouletteBoard() {
  const { items, result, isSpinning, spin } = useRoulette();

  return (
    <div className={styles.board}>
      <ul className={styles.items}>
        {items.map((item) => {
          const isWinner = !isSpinning && result?.id === item.id;
          return (
            <li
              key={item.id}
              className={`${styles.item} ${isWinner ? styles.winner : ""}`}
            >
              {item.label}
            </li>
          );
        })}
      </ul>

      <button
        className={styles.spinButton}
        onClick={spin}
        disabled={isSpinning || items.length === 0}
      >
        {isSpinning ? "回転中…" : "回す"}
      </button>

      <p className={styles.result} aria-live="polite">
        {result ? `結果: ${result.label}` : isSpinning ? "抽選中…" : " "}
      </p>
    </div>
  );
}
