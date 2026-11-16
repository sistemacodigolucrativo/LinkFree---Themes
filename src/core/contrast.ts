export interface RgbColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

export function parseColor(input: string): RgbColor | null {
  const trimmed = input.trim();

  // #RGB or #RRGGBB or #RRGGBBAA
  const hexMatch = /^#([0-9a-fA-F]{3,8})$/.exec(trimmed);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
        a: 1,
      };
    }
    if (hex.length === 6 || hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
      };
    }
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbaMatch =
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)$/i.exec(
      trimmed,
    );
  if (rgbaMatch) {
    return {
      r: clamp(Number(rgbaMatch[1]), 0, 255),
      g: clamp(Number(rgbaMatch[2]), 0, 255),
      b: clamp(Number(rgbaMatch[3]), 0, 255),
      a: rgbaMatch[4] !== undefined ? clamp(Number(rgbaMatch[4]), 0, 1) : 1,
    };
  }

  return null;
}

export function hexToRgbaString(hex: string, alpha = 1): string {
  const parsed = parseColor(hex) ?? { r: 15, g: 23, b: 42, a: 1 };
  const effectiveAlpha = clamp(alpha, 0, 1);
  return `rgba(${parsed.r}, ${parsed.g}, ${parsed.b}, ${Number(effectiveAlpha.toFixed(2))})`;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function normalizeToHex(input: string, fallback = '#000000'): string {
  const parsed = parseColor(input);
  if (!parsed) return fallback;
  return rgbToHex(parsed.r, parsed.g, parsed.b);
}

export function compositeOver(fg: RgbColor, bg: RgbColor): RgbColor {
  const a = fg.a;
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
    a: 1,
  };
}

export function relativeLuminance(color: RgbColor): number {
  const channel = (c: number) => {
    const srgb = c / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
}

export function contrastRatio(fgInput: string, bgInput: string, backdropFallback = '#0a0d14'): number {
  const backdrop = parseColor(backdropFallback) ?? { r: 10, g: 13, b: 20, a: 1 };
  const rawBg = parseColor(bgInput) ?? backdrop;
  const solidBg = rawBg.a < 1 ? compositeOver(rawBg, backdrop) : rawBg;
  const rawFg = parseColor(fgInput) ?? { r: 255, g: 255, b: 255, a: 1 };
  const solidFg = rawFg.a < 1 ? compositeOver(rawFg, solidBg) : rawFg;

  const l1 = relativeLuminance(solidFg);
  const l2 = relativeLuminance(solidBg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function getContrastRating(ratio: number): 'AAA' | 'AA' | 'AA Large' | 'Baixo' {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Baixo';
}
