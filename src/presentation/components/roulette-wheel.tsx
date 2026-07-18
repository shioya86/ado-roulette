"use client";

import { useEffect, useRef, useState } from "react";
import { RouletteItemDTO } from "@/application/dto/roulette-item-dto";
import { useRoulette } from "@/presentation/hooks/use-roulette";
import { Confetti } from "./confetti";
import styles from "./roulette-wheel.module.css";

/** CSS の transform 行列（matrix(a,b,...)）から回転角（度）を取り出す。 */
function angleFromTransform(transform: string): number | null {
  if (!transform || transform === "none") return null;
  const m = transform.match(/matrix\(([^)]+)\)/);
  if (!m) return null;
  const [a, b] = m[1].split(",").map((v) => parseFloat(v));
  return (Math.atan2(b, a) * 180) / Math.PI;
}

// 扇形の色（Ado の青に寄せたクールトーンで統一）。項目数に合わせて循環。
const PALETTE = [
  "#4895ef",
  "#4361ee",
  "#3f37c9",
  "#4cc9f0",
  "#560bad",
  "#7209b7",
];

// セクター間に入れる細い白の区切り線の幅（度）。モダンな分割感を出す。
const GAP_DEG = 1.2;

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

  // 回転中に「いまポインタ真下に来ている項目」。
  const [current, setCurrent] = useState<RouletteItemDTO | null>(null);
  const wheelRef = useRef<HTMLDivElement | null>(null);

  // 演出まわり: 紙吹雪。
  const [burstId, setBurstId] = useState(0); // 変わるたびに紙吹雪を1回打つ
  const prevIdxRef = useRef(-1);

  const count = items.length;
  const seg = count > 0 ? 360 / count : 0;

  // 回転中は毎フレーム実際の角度を読み、ポインタ真下のセクターを更新する。
  useEffect(() => {
    if (!isSpinning || seg === 0) {
      prevIdxRef.current = -1;
      return;
    }
    let raf = 0;
    const tick = () => {
      const el = wheelRef.current;
      if (el) {
        const deg = angleFromTransform(getComputedStyle(el).transform);
        if (deg !== null) {
          const topAngle = ((-deg % 360) + 360) % 360; // 真上に来ている角度
          const idx = Math.floor(topAngle / seg) % count;
          if (idx !== prevIdxRef.current) {
            prevIdxRef.current = idx;
            setCurrent(items[idx] ?? null);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isSpinning, seg, count, items]);

  // 停止して結果が確定したら、紙吹雪を打つ。
  useEffect(() => {
    if (result && !isSpinning) {
      setBurstId((b) => b + 1);
    }
  }, [result, isSpinning]);

  // 扇形の背景（conic-gradient は 0deg = 真上、時計回り）。
  // 各セクターの末尾に細い白線を挟んで、モダンな分割線にする。
  const background =
    count > 0
      ? `conic-gradient(from 0deg, ${items
          .map((_, i) => {
            const c = PALETTE[i % PALETTE.length];
            const start = i * seg;
            const end = (i + 1) * seg;
            return `${c} ${start}deg ${end - GAP_DEG}deg, #ffffff ${
              end - GAP_DEG
            }deg ${end}deg`;
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
      <Confetti burstId={burstId} />

      <div className={styles.stage}>
        {/* 上部の固定ポインタ */}
        <div className={styles.pointer} aria-hidden />

        {/* 回転する円盤 */}
        <div
          ref={wheelRef}
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
                  (!isSpinning && result?.id === item.id) ||
                  (isSpinning && current?.id === item.id)
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

      {/* 回転中の実況（毎フレーム変わるので視覚のみ。読み上げはしない）。 */}
      <p
        className={
          !isSpinning && result
            ? `${styles.result} ${styles.resultWin}`
            : styles.result
        }
        aria-hidden
      >
        {isSpinning ? (current?.label ?? "…") : result ? `結果: ${result.label}` : " "}
      </p>

      {/* 最終結果だけをスクリーンリーダーに通知する。 */}
      <p className={styles.srOnly} aria-live="polite">
        {!isSpinning && result ? `結果: ${result.label}` : ""}
      </p>
    </div>
  );
}
