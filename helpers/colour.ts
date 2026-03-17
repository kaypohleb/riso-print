/**
 * Standard RGB to CMYK conversion (under-color removal).
 * Returns [cyan, magenta, yellow, black] in 0–1 range.
 */
export function RGBtoCMYBSplit(r: number, g: number, b: number): number[] {
  const r_ = r / 255;
  const g_ = g / 255;
  const b_ = b / 255;

  const black = 1 - Math.max(r_, g_, b_);

  if (black >= 1) {
    return [0, 0, 0, 1];
  }

  const divisor = 1 - black;
  const cyan = (1 - r_ - black) / divisor;
  const magenta = (1 - g_ - black) / divisor;
  const yellow = (1 - b_ - black) / divisor;

  return [cyan, magenta, yellow, black];
}

