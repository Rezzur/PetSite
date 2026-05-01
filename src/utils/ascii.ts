import { asciiSymbols, backgroundGlyphs, codeFragments } from '../data/content';

const burstSymbols = ['.', ':', ';', '/', '\\', '|', '_', '-', '+', '*', '#', '0', '1', 'x'];

export function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export function pickAscii(index: number) {
  return asciiSymbols[index % asciiSymbols.length];
}

export function buildGlyphGrid(count: number, seed = 41) {
  const random = seededRandom(seed);

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    char: backgroundGlyphs[Math.floor(random() * backgroundGlyphs.length)],
    x: random() * 100,
    y: random() * 100,
    opacity: 0.035 + random() * 0.075,
    delay: random() * 5
  }));
}

export function buildCodeFragments(count: number, seed = 72) {
  const random = seededRandom(seed);

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    text: codeFragments[Math.floor(random() * codeFragments.length)],
    x: random() * 100,
    y: random() * 100,
    opacity: 0.025 + random() * 0.07,
    delay: random() * 4,
    rotate: -8 + random() * 16
  }));
}

export function buildBurstParticles(count: number, seed = 17) {
  const random = seededRandom(seed);

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    char: burstSymbols[Math.floor(random() * burstSymbols.length)],
    angle: (index / count) * 360 + random() * 18,
    distance: 28 + random() * 58,
    delay: random() * 0.08
  }));
}
