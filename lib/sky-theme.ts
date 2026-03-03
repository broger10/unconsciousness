import type { AspectType } from "./astro-constants";
import { SIGN_DEGREES } from "./astro-constants";

// Planetary DNA — HSL color identity for each planet
const PLANET_HSL: Record<string, { h: number; s: number; l: number }> = {
  Sole: { h: 45, s: 85, l: 55 },
  Luna: { h: 220, s: 30, l: 75 },
  Mercurio: { h: 170, s: 50, l: 50 },
  Venere: { h: 330, s: 45, l: 55 },
  Marte: { h: 10, s: 70, l: 45 },
  Giove: { h: 35, s: 65, l: 50 },
  Saturno: { h: 200, s: 15, l: 35 },
  Urano: { h: 180, s: 60, l: 45 },
  Nettuno: { h: 260, s: 40, l: 50 },
  Plutone: { h: 280, s: 50, l: 30 },
};

export interface DailyTheme {
  primary: string;
  secondary: string;
  accent: string;
  cssVars: Record<string, string>;
}

function hslToString(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

// Weighted circular mean for hue (handles wraparound at 360°)
function weightedCircularMeanHue(
  values: { h: number; weight: number }[]
): number {
  let sinSum = 0;
  let cosSum = 0;
  let totalWeight = 0;
  for (const { h, weight } of values) {
    const rad = (h * Math.PI) / 180;
    sinSum += Math.sin(rad) * weight;
    cosSum += Math.cos(rad) * weight;
    totalWeight += weight;
  }
  if (totalWeight === 0) return 45; // fallback gold
  const avgRad = Math.atan2(sinSum / totalWeight, cosSum / totalWeight);
  return ((avgRad * 180) / Math.PI + 360) % 360;
}

export function computeDailyTheme(
  significantTransits: Array<{
    transitPlanet: string;
    aspect: AspectType;
    natalPlanet: string;
    weight: number;
  }>
): DailyTheme {
  if (significantTransits.length === 0) {
    // Fallback: warm gold theme
    return {
      primary: hslToString(45, 70, 45),
      secondary: hslToString(45, 50, 55),
      accent: hslToString(45, 85, 55),
      cssVars: {
        "--sky-primary": hslToString(45, 70, 45),
        "--sky-secondary": hslToString(45, 50, 55),
        "--sky-accent": hslToString(45, 85, 55),
      },
    };
  }

  // Primary: weighted mix of top 3 transit planets
  const top3 = significantTransits.slice(0, 3);
  const hueInputs = top3
    .map((t) => {
      const hsl = PLANET_HSL[t.transitPlanet];
      if (!hsl) return null;
      return { h: hsl.h, weight: t.weight };
    })
    .filter(Boolean) as { h: number; weight: number }[];

  const primaryHue = weightedCircularMeanHue(hueInputs);

  let totalWeight = 0;
  let sSum = 0;
  let lSum = 0;
  for (const t of top3) {
    const hsl = PLANET_HSL[t.transitPlanet];
    if (!hsl) continue;
    totalWeight += t.weight;
    sSum += hsl.s * t.weight;
    lSum += hsl.l * t.weight;
  }
  const primaryS = totalWeight > 0 ? sSum / totalWeight : 60;
  const primaryL = totalWeight > 0 ? lSum / totalWeight : 45;

  // Secondary: softer version
  const secondaryS = Math.max(15, primaryS - 20);
  const secondaryL = Math.min(70, primaryL + 10);

  // Accent: strongest transit planet color
  const strongestPlanet = significantTransits[0].transitPlanet;
  const accentHsl = PLANET_HSL[strongestPlanet] || { h: 45, s: 85, l: 55 };

  const primary = hslToString(primaryHue, primaryS, primaryL);
  const secondary = hslToString(primaryHue, secondaryS, secondaryL);
  const accent = hslToString(accentHsl.h, accentHsl.s, accentHsl.l);

  return {
    primary,
    secondary,
    accent,
    cssVars: {
      "--sky-primary": primary,
      "--sky-secondary": secondary,
      "--sky-accent": accent,
    },
  };
}

/**
 * Compute star X/Y for La Mappa from significant transits.
 * X = zodiacal position of dominant transit planet's sign (0-100)
 * Y = transit intensity inverted (high weight = top = low Y), range 10-85
 */
export function computeStarPosition(
  significantTransits: Array<{ transitPlanet: string; weight: number }>,
  currentPositions: Array<{ planet: string; sign: string }>
): { starX: number; starY: number } {
  if (significantTransits.length === 0) {
    return { starX: 50, starY: 50 };
  }

  const dominant = significantTransits[0];

  // Find the current sign of the dominant transit planet
  const dominantPosition = currentPositions.find(
    (p) => p.planet === dominant.transitPlanet
  );
  const dominantSign = dominantPosition?.sign ?? "Ariete";
  const signDegree = SIGN_DEGREES[dominantSign] ?? 15;

  // X: zodiacal degree mapped to 0-100
  const starX = (signDegree / 360) * 100;

  // Y: max weight inverted (high = top of screen = low Y)
  const maxWeight = Math.max(...significantTransits.map((t) => t.weight));
  const normalizedWeight = Math.min(1, Math.max(0, maxWeight / 20));
  const starY = 10 + (1 - normalizedWeight) * 75;

  return {
    starX: Math.round(starX * 100) / 100,
    starY: Math.round(starY * 100) / 100,
  };
}
