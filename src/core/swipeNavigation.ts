export function stepProjectIndex(currentIndex: number, total: number, delta: -1 | 1): number {
  if (total <= 0) return 0;
  const safeCurrent = ((currentIndex % total) + total) % total;
  return (safeCurrent + delta + total) % total;
}

export function evaluateHorizontalSwipe(
  dx: number,
  dy: number,
  durationMs: number,
): 'next' | 'prev' | null {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (absX < 32 || absX <= absY * 1.2) {
    return null;
  }

  const isQuickFlick = durationMs > 0 && durationMs <= 280 && absX >= 36;
  const isLongDrag = absX >= 58;

  if (!isQuickFlick && !isLongDrag) {
    return null;
  }

  return dx < 0 ? 'next' : 'prev';
}
