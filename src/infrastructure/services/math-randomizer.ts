import { Randomizer } from "@/application/ports/randomizer";

/**
 * MathRandomizer — Randomizer ポートの本番実装
 *
 * Math.random（0以上1未満の一様乱数）を使って
 * 0 以上 size 未満の整数を均等に選ぶ。
 *
 * 「Math.random に触れてよいのはここだけ」。
 * application / domain はこの実装を知らず、Randomizer 契約だけを見る。
 */
export class MathRandomizer implements Randomizer {
  nextIndex(size: number): number {
    if (!Number.isInteger(size) || size <= 0) {
      throw new Error(`size must be a positive integer: ${size}`);
    }
    // Math.random() は [0, 1) なので、size を掛けて floor すると
    // 0 〜 size-1 が均等な確率で得られる。
    return Math.floor(Math.random() * size);
  }
}
