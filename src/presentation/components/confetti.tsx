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

// 青薔薇をイメージした花弁の色（青系）。
const PETAL_COLORS = [
  "#1b3fd1",
  "#2f5cff",
  "#3a5bef",
  "#5b7cff",
  "#1e3a8a",
  "#8fb0ff",
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
  color: string;
  life: number;
}

/**
 * Confetti — 当選時の演出（外部ライブラリなし・canvas で自前描画）
 *
 * burstId が変わるたびに、
 *   - カラフルな紙吹雪（弾けて落ちる）
 *   - 青薔薇イメージの青い花弁（ひらひら揺れながら舞い落ちる）
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
    const particles: Particle[] = Array.from({ length: 140 }, () => ({
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

    // 青い花弁（少なめ・ゆっくり・ひらひら）。
    const petals: Petal[] = Array.from({ length: 40 }, () => ({
      x: originX + (Math.random() - 0.5) * 120 * dpr,
      y: originY + (Math.random() - 0.5) * 40 * dpr,
      vx: (Math.random() - 0.5) * 6 * dpr,
      vy: (Math.random() * -5 - 0.5) * dpr,
      size: (Math.random() * 6 + 8) * dpr,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.06,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: 0.05 + Math.random() * 0.05,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.03 + Math.random() * 0.03,
      swayAmp: (0.6 + Math.random() * 1.2) * dpr,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      life: 1,
    }));

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

      // 青い花弁（左右に揺れながら裏返って落ちる）。
      for (const pt of petals) {
        pt.vy += petalGravity;
        pt.vy = Math.min(pt.vy, 3.2 * dpr); // ふわっと落ちる（終端速度を抑える）
        pt.x += pt.vx + Math.sin(frame * pt.swaySpeed + pt.swayPhase) * pt.swayAmp;
        pt.y += pt.vy;
        pt.rot += pt.vrot;
        pt.flip += pt.flipSpeed;
        if (frame > 45) pt.life -= 0.009; // 紙吹雪より長く漂う

        ctx.save();
        ctx.globalAlpha = Math.max(0, pt.life) * 0.92;
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        // scaleX を振らすと薄い花弁が裏返るように見える。
        ctx.scale(Math.cos(pt.flip), 1);
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.size, pt.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      const anyAlive =
        particles.some((p) => p.life > 0) || petals.some((p) => p.life > 0);
      if (frame < 320 && anyAlive) {
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
