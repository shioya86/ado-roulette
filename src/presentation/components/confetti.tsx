"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#e0397a",
  "#f5a623",
  "#7ed321",
  "#4a90e2",
  "#9013fe",
  "#50e3c2",
  "#fff59d",
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

/**
 * Confetti — 紙吹雪の演出（外部ライブラリなし・canvas で自前描画）
 *
 * burstId が変わるたびに画面上部から紙吹雪を1回打ち上げる。
 * 純粋な見た目の演出なので presentation 層に閉じている。
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

    // 上部中央から扇状に打ち上げる。
    const particles: Particle[] = Array.from({ length: 150 }, () => ({
      x: w / 2,
      y: h * 0.32,
      vx: (Math.random() - 0.5) * 16 * dpr,
      vy: (Math.random() * -13 - 3) * dpr,
      size: (Math.random() * 6 + 4) * dpr,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 1,
    }));

    const gravity = 0.35 * dpr;
    let raf = 0;
    let frame = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      frame++;
      for (const p of particles) {
        p.vy += gravity;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vrot;
        if (frame > 55) p.life -= 0.018; // しばらく漂ってからフェードアウト

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      }

      if (frame < 200 && particles.some((p) => p.life > 0)) {
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
