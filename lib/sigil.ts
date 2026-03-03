import { PLANET_SYMBOLS, type AspectType } from "./astro-constants";

interface SigilTransit {
  transitPlanet: string;
  aspect: AspectType;
  natalPlanet: string;
  weight: number;
}

interface SigilNatal {
  name: string;
  sign: string;
}

// Aspect line styles
const ASPECT_STYLES: Record<string, { stroke: string; dasharray: string }> = {
  congiunzione: { stroke: "rgba(201,168,76,0.4)", dasharray: "" },
  sestile: { stroke: "rgba(74,155,142,0.3)", dasharray: "4,4" },
  trigono: { stroke: "rgba(74,155,142,0.35)", dasharray: "6,3" },
  quadratura: { stroke: "rgba(196,97,74,0.35)", dasharray: "3,3" },
  opposizione: { stroke: "rgba(196,97,74,0.3)", dasharray: "2,4" },
};

// Map sign to degree on the ecliptic (midpoint)
function signToDegree(sign: string): number {
  const signs = [
    "Ariete", "Toro", "Gemelli", "Cancro",
    "Leone", "Vergine", "Bilancia", "Scorpione",
    "Sagittario", "Capricorno", "Acquario", "Pesci",
  ];
  const idx = signs.indexOf(sign);
  return idx >= 0 ? idx * 30 + 15 : 0;
}

function degToPos(
  degree: number,
  radius: number,
  cx: number,
  cy: number
): { x: number; y: number } {
  const rad = ((degree - 90) * Math.PI) / 180; // -90 to start from top
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export function generateSigil(
  transits: SigilTransit[],
  natalPlanets: SigilNatal[],
  accentColor: string
): string {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 85;
  const transitR = 75;
  const natalR = 50;

  const parts: string[] = [];

  // SVG open
  parts.push(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`
  );

  // Outer circle
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="${accentColor}" stroke-opacity="0.2" stroke-width="0.5"/>`
  );

  // Inner circle
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="${natalR}" fill="none" stroke="${accentColor}" stroke-opacity="0.1" stroke-width="0.5"/>`
  );

  // Track positions for aspect lines
  const transitPositions: Record<string, { x: number; y: number }> = {};
  const natalPositions: Record<string, { x: number; y: number }> = {};

  // Place natal planets on inner circle
  const uniqueNatals = new Set<string>();
  for (const t of transits) {
    uniqueNatals.add(t.natalPlanet);
  }
  for (const natal of natalPlanets) {
    if (!uniqueNatals.has(natal.name)) continue;
    const deg = signToDegree(natal.sign);
    const pos = degToPos(deg, natalR, cx, cy);
    natalPositions[natal.name] = pos;
    const symbol = PLANET_SYMBOLS[natal.name] || "?";
    parts.push(
      `<text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="central" fill="${accentColor}" fill-opacity="0.5" font-size="10">${symbol}</text>`
    );
  }

  // Place transit planets on outer circle
  const placedTransits = new Set<string>();
  for (const t of transits) {
    if (placedTransits.has(t.transitPlanet)) continue;
    placedTransits.add(t.transitPlanet);

    // Use a rough degree based on the transit planet's position in the sky
    // For simplicity, space them evenly around the circle based on their order
    const idx = transits.findIndex((tr) => tr.transitPlanet === t.transitPlanet);
    const deg = (idx * 72 + 20) % 360; // space 5 planets ~72° apart
    const pos = degToPos(deg, transitR, cx, cy);
    transitPositions[t.transitPlanet] = pos;
    const symbol = PLANET_SYMBOLS[t.transitPlanet] || "?";
    parts.push(
      `<text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="central" fill="${accentColor}" fill-opacity="0.8" font-size="12">${symbol}</text>`
    );
  }

  // Draw aspect lines
  for (const t of transits) {
    const from = transitPositions[t.transitPlanet];
    const to = natalPositions[t.natalPlanet];
    if (!from || !to) continue;

    const style = ASPECT_STYLES[t.aspect] || ASPECT_STYLES.congiunzione;
    parts.push(
      `<line x1="${from.x.toFixed(1)}" y1="${from.y.toFixed(1)}" x2="${to.x.toFixed(1)}" y2="${to.y.toFixed(1)}" stroke="${style.stroke}" stroke-width="0.8"${style.dasharray ? ` stroke-dasharray="${style.dasharray}"` : ""}/>`
    );
  }

  // Center dot
  parts.push(
    `<circle cx="${cx}" cy="${cy}" r="2" fill="${accentColor}" fill-opacity="0.3"/>`
  );

  parts.push("</svg>");

  return parts.join("\n");
}
