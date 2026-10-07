const toRgb = (hex: string) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (r: number, g: number, b: number) =>
  "#" +
  [r, g, b]
    .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0"))
    .join("");

/** Mix two hex colours. t = 0 → a, t = 1 → b */
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = toRgb(a);
  const [r2, g2, b2] = toRgb(b);
  return toHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export const lighten = (c: string, t: number) => mix(c, "#ffffff", t);
export const darken = (c: string, t: number) => mix(c, "#000000", t);

export function rgba(hex: string, a: number): string {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** A see-through version of any CSS colour (works with the theme colours too). a = 0–1 */
export const alpha = (colour: string, a: number) => `color-mix(in srgb, ${colour} ${Math.round(a * 100)}%, transparent)`;

/** Small seeded random so drawings are stable between renders */
export function seeded(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
