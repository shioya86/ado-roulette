"use client";

import { useEffect, useRef } from "react";

// 紙吹雪の色（カラフル）。
const CONFETTI_COLORS = [
  "#e0397a",
  "#f5a623",
  "#7ed321",
  "#4a90e2",
  "#9013fe",
  "#50e3c2",
  "#fff59d",
];

// 青薔薇イメージの花弁の色。[表: 明るい, 表: 濃い（グラデ下端）, 裏: さらに濃い]
const PETAL_TONES: Array<[string, string, string]> = [
  ["#8fb0ff", "#1b3fd1", "#122a8f"],
  ["#a9c3ff", "#2f5cff", "#1a3ac0"],
  ["#7c9dff", "#1e3a8a", "#132a63"],
  ["#b7ccff", "#3a5bef", "#243c9c"],
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  color: string;
  life: number;
}

interface Petal {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vrot: number;
  flip: number; // 裏返り（scaleX の位相）
  flipSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  grad: CanvasGradient; // 表面のグラデ（上=明るい, 下=濃い）
  back: string; // 裏面の色
  life: number;
}

/** ハート型の花弁パスを現在の座標系に描く（下が尖り、上に2つの膨らみと切れ込み）。 */
function heartPetalPath(ctx: CanvasRenderingContext2D, s: number) {
  ctx.beginPath();
  ctx.moveTo(0, s * 0.85); // 下の尖り
  ctx.bezierCurveTo(-s * 1.2, s * 0.1, -s * 0.78, -s * 0.95, 0, -s * 0.28);
  ctx.bezierCurveTo(s * 0.78, -s * 0.95, s * 1.2, s * 0.1, 0, s * 0.85);
  ctx.closePath();
}

/**
 * Confetti — 当選時の演出（外部ライブラリなし・canvas で自前描画）
 *
 * burstId が変わるたびに、
 *   - カラフルな紙吹雪（弾けて落ちる）
 *   - 青薔薇イメージの厚みのあるハート型の花弁（揺れ・裏返りながら舞い落ちる）
 * を1回打ち上げる。純粋な見た目の演出なので presentation 層に閉じている。
 * prefers-reduced-motion が有効なら何も描かない。
 */
export function Confetti({ burstId }: { burstId: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (burstId === 0) return; // 初回マウント時は発火しない

    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = (canvas.width = window.innerWidth * dpr);
    const h = (canvas.height = window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const originX = w / 2;
    const originY = h * 0.32;

    // カラフルな紙吹雪。
    const particles: Particle[] = Array.from({ length: 130 }, () => ({
      x: originX,
      y: originY,
      vx: (Math.random() - 0.5) * 16 * dpr,
      vy: (Math.random() * -13 - 3) * dpr,
      size: (Math.random() * 6 + 4) * dpr,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.35,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      life: 1,
    }));

    // 青い花弁（少なめ・大きめ・ゆっくり・ひらひら）。
    const petals: Petal[] = Array.from({ length: 38 }, () => {
      const size = (Math.random() * 7 + 11) * dpr;
      const tone = PETAL_TONES[Math.floor(Math.random() * PETAL_TONES.length)];
      // 表面グラデ: 花弁上部を明るく、下部を濃く（立体感）。
      const grad = ctx.createLinearGradient(0, -size, 0, size);
      grad.addColorStop(0, tone[0]);
      grad.addColorStop(1, tone[1]);
      return {
        x: originX + (Math.random() - 0.5) * 120 * dpr,
        y: originY + (Math.random() - 0.5) * 40 * dpr,
        vx: (Math.random() - 0.5) * 6 * dpr,
        vy: (Math.random() * -5 - 0.5) * dpr,
        size,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.05,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: 0.045 + Math.random() * 0.05,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.03 + Math.random() * 0.03,
        swayAmp: (0.6 + Math.random() * 1.2) * dpr,
        grad,
        back: tone[2],
        life: 1,
      };
    });

    const gravity = 0.35 * dpr;
    const petalGravity = 0.1 * dpr;
    let raf = 0;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;

      // 紙吹雪。
      for (const p of particles) {
        p.vy += gravity;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        if (frame > 55) p.life -= 0.018;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      }

      // 青い花弁（揺れながら裏返って落ちる）。
      for (const pt of petals) {
        pt.vy += petalGravity;
        pt.vy = Math.min(pt.vy, 3.2 * dpr); // ふわっと落ちる（終端速度を抑える）
        pt.x += pt.vx + Math.sin(frame * pt.swaySpeed + pt.swayPhase) * pt.swayAmp;
        pt.y += pt.vy;
        pt.rot += pt.vrot;
        pt.flip += pt.flipSpeed;
        if (frame > 45) pt.life -= 0.008; // 紙吹雪より長く漂う

        const facing = Math.cos(pt.flip); // +:表 / 0:真横（薄い） / -:裏

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.scale(facing, 1); // 横に潰れて裏返るフラッター

        heartPetalPath(ctx, pt.size);
        if (facing >= 0) {
          // 表: グラデ + 上部に白いツヤ
          ctx.fillStyle = pt.grad;
          ctx.fill();
          ctx.globalAlpha = Math.max(0, pt.life) * 0.35;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.ellipse(
            0,
            -pt.size * 0.25,
            pt.size * 0.42,
            pt.size * 0.28,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        } else {
          // 裏: 濃い単色
          ctx.fillStyle = pt.back;
          ctx.fill();
        }
        ctx.restore();
      }

      const anyAlive =
        particles.some((p) => p.life > 0) || petals.some((p) => p.life > 0);
      if (frame < 340 && anyAlive) {
        raf = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    };
    raf = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(raf);
  }, [burstId]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 50,
      }}
    />
  );
}
