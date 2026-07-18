"use client";

import { useCallback, useRef } from "react";

/**
 * useSound — 効果音（WebAudio でその場生成、音声ファイル不要）
 *
 * - tick(): 回転中にセクターを通過するたびの短い「カチ」音
 * - win():  停止時のファンファーレ（4音の上昇アルペジオ）
 *
 * 純粋な演出なので presentation 層に閉じている。
 * AudioContext はユーザー操作（回すクリック）後に生成されるので自動再生制限に抵触しない。
 */
export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const ensureContext = (): AudioContext | null => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    // タブ復帰などで suspended になっていたら再開する。
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  };

  /** 単発の短い音を鳴らす小さなヘルパー。 */
  const beep = (
    ac: AudioContext,
    freq: number,
    startAt: number,
    duration: number,
    type: OscillatorType,
    peak: number,
  ) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  };

  const tick = useCallback(() => {
    const ac = ensureContext();
    if (!ac) return;
    beep(ac, 900, ac.currentTime, 0.05, "square", 0.06);
  }, []);

  const win = useCallback(() => {
    const ac = ensureContext();
    if (!ac) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((f, i) => {
      beep(ac, f, ac.currentTime + i * 0.11, 0.3, "triangle", 0.12);
    });
  }, []);

  return { tick, win };
}
