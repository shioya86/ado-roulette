"use client";

import { useRef, useState } from "react";
import { useRoulette } from "@/presentation/hooks/use-roulette";
import styles from "./roulette-wheel.module.css";

// 扇形の色。項目数に合わせて循環して使う。
const PALETTE = [
  "#e0397a",
  "#f5a623",
  "#7ed321",
  "#4a90e2",
  "#9013fe",
  "#50e3c2",
];

/**
 * RouletteWheel — 回転する円盤 UI
 *
 * 当選項目は useRoulette（＝ユースケース）が先に決める。
 * このコンポーネントは「その当選セクターが上部ポインタの真下で止まる」よう
 * 盤の回転角を計算して回すだけ。抽選ロジックも乱数もここには無い。
 */
export function RouletteWheel() {
  const { items, result, isSpinning, startSpin, endSpin } = useRoulette();

  // 盤の累積回転角（deg）。単調増加させ、毎回さらに数周まわす。
  const [rotation, setRotation] = useState(0);
  const [durationMs, setDurationMs] = useState(4000);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const count = items.length;
  const seg = count > 0 ? 360 / count : 0;

  // 扇形の背景（conic-gradient は 0deg = 真上、時計回り）。
  const background =
    count > 0
      ? `conic-gradient(from 0deg, ${items
          .map((_, i) => {
            const c = PALETTE[i % PALETTE.length];
            return `${c} ${i * seg}deg ${(i + 1) * seg}deg`;
          })
          .join(", ")})`
      : "#eee";

  const handleSpin = async () => {
    const winner = await startSpin();
    if (!winner) return;

    const idx = items.findIndex((i) => i.id === winner.id);
    if (idx < 0) {
      endSpin(winner);
      return;
    }

    // 当選セクターの中心角（真上=0 から時計回り）。
    const center = idx * seg + seg / 2;
    // この中心をポインタ（真上=0）に持ってくるための最終角度（mod 360）。
    const targetMod = (360 - center) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;

    // アクセシビリティ: 動きを減らす設定なら回転を抑える。
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    const spins = reduce ? 0 : 5; // 追加の周回数
    const delta =
      spins * 360 + ((((targetMod - currentMod) % 360) + 360) % 360);
    const ms = reduce ? 200 : 4000;

    setDurationMs(ms);
    setRotation((r) => r + delta);

    // アニメーション完了後に結果を表示（transitionend より確実にタイマーで確定）。
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => endSpin(winner), ms + 50);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.stage}>
        {/* 上部の固定ポインタ */}
        <div className={styles.pointer} aria-hidden />

        {/* 回転する円盤 */}
        <div
          className={styles.wheel}
          style={{
            background,
            transform: `rotate(${rotation}deg)`,
            transitionDuration: `${durationMs}ms`,
          }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className={styles.label}
              style={{ transform: `translateX(-50%) rotate(${i * seg + seg / 2}deg)` }}
            >
              <span
                className={
                  !isSpinning && result?.id === item.id
                    ? `${styles.labelText} ${styles.winnerText}`
                    : styles.labelText
                }
              >
                {item.label}
              </span>
            </div>
          ))}

          {/* 中心のハブ */}
          <div className={styles.hub} aria-hidden />
        </div>
      </div>

      <button
        className={styles.spinButton}
        onClick={handleSpin}
        disabled={isSpinning || count === 0}
      >
        {isSpinning ? "回転中…" : "回す"}
      </button>

      <p className={styles.result} aria-live="polite">
        {result ? `結果: ${result.label}` : isSpinning ? "抽選中…" : " "}
      </p>
    </div>
  );
}
