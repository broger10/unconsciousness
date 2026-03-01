// Zodiac signs with their degree ranges (0-360 ecliptic longitude)
export const ZODIAC_SIGNS = [
  "Ariete", "Toro", "Gemelli", "Cancro",
  "Leone", "Vergine", "Bilancia", "Scorpione",
  "Sagittario", "Capricorno", "Acquario", "Pesci",
] as const;

export type ZodiacSign = typeof ZODIAC_SIGNS[number];

// Approximate degree for sign midpoint (used for rough aspect calculation)
export const SIGN_DEGREES: Record<string, number> = {
  Ariete: 15, Toro: 45, Gemelli: 75, Cancro: 105,
  Leone: 135, Vergine: 165, Bilancia: 195, Scorpione: 225,
  Sagittario: 255, Capricorno: 285, Acquario: 315, Pesci: 345,
};

// Major aspects and their degree separations
export const ASPECTS = {
  congiunzione: { degrees: 0, symbol: "☌", orb: 3 },
  opposizione: { degrees: 180, symbol: "☍", orb: 3 },
  trigono: { degrees: 120, symbol: "△", orb: 3 },
  quadratura: { degrees: 90, symbol: "□", orb: 3 },
} as const;

export type AspectType = keyof typeof ASPECTS;

// Planet symbols for display
export const PLANET_SYMBOLS: Record<string, string> = {
  Sole: "☉", Luna: "☽", Mercurio: "☿", Venere: "♀",
  Marte: "♂", Giove: "♃", Saturno: "♄",
  Urano: "♅", Nettuno: "♆", Plutone: "♇",
  Chirone: "⚷", "Nodo Nord": "☊",
};

// Approximate current transit positions (updated periodically)
// These represent rough positions for slow-moving planets in 2026
// Fast planets (Sun, Moon, Mercury, Venus, Mars) change frequently
export function getCurrentTransits(): Array<{ planet: string; sign: string; degree: number }> {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );

  // Sun moves ~1 degree per day, starting at ~280 degrees (Capricorno) on Jan 1
  const sunDeg = (280 + dayOfYear) % 360;

  // Moon moves ~13 degrees per day
  // Approximate based on a known reference: Jan 1 2026 Moon ~120 degrees (Leone)
  const moonDeg = (120 + dayOfYear * 13.176) % 360;

  // Slow-moving planets (approximate positions for 2026)
  const transits = [
    { planet: "Sole", degree: sunDeg },
    { planet: "Luna", degree: moonDeg },
    // Mercury stays roughly near the sun ±28 degrees
    { planet: "Mercurio", degree: (sunDeg + 15) % 360 },
    // Venus stays roughly near the sun ±47 degrees
    { planet: "Venere", degree: (sunDeg - 20 + 360) % 360 },
    // Mars ~2026 approximate
    { planet: "Marte", degree: (85 + dayOfYear * 0.524) % 360 },
    // Jupiter in Cancro 2026
    { planet: "Giove", degree: (100 + dayOfYear * 0.083) % 360 },
    // Saturn in Ariete/Toro 2026
    { planet: "Saturno", degree: (15 + dayOfYear * 0.033) % 360 },
    // Uranus in Gemelli 2026
    { planet: "Urano", degree: (72 + dayOfYear * 0.012) % 360 },
    // Neptune in Ariete/Pesci boundary 2026
    { planet: "Nettuno", degree: (0 + dayOfYear * 0.006) % 360 },
    // Pluto in Acquario 2026
    { planet: "Plutone", degree: (305 + dayOfYear * 0.004) % 360 },
  ];

  return transits.map((t) => ({
    ...t,
    sign: degreeToSign(t.degree),
  }));
}

function degreeToSign(degree: number): string {
  const index = Math.floor(degree / 30) % 12;
  return ZODIAC_SIGNS[index];
}

// Calculate aspect between two degree positions
export function calculateAspect(
  deg1: number,
  deg2: number
): { type: AspectType; exact: number } | null {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;

  for (const [name, aspect] of Object.entries(ASPECTS)) {
    if (Math.abs(diff - aspect.degrees) <= aspect.orb) {
      return { type: name as AspectType, exact: Math.abs(diff - aspect.degrees) };
    }
  }
  return null;
}

// Convert sign name to its starting degree (0-based)
function signStartDegree(sign: string): number {
  const idx = ZODIAC_SIGNS.indexOf(sign as ZodiacSign);
  return idx >= 0 ? idx * 30 : 0;
}

// Find significant transits for a natal chart
// Uses real transit degrees vs natal sign midpoints (best precision available)
export function findSignificantTransits(
  natalPlanets: Array<{ name: string; sign: string }>
): Array<{
  transitPlanet: string;
  aspect: AspectType;
  natalPlanet: string;
  description: string;
}> {
  const currentTransits = getCurrentTransits();
  const results: Array<{
    transitPlanet: string;
    aspect: AspectType;
    natalPlanet: string;
    description: string;
    weight: number;
  }> = [];

  // Weight slow planets more heavily (more significant transits)
  const planetWeight: Record<string, number> = {
    Plutone: 10, Nettuno: 9, Urano: 8, Saturno: 7, Giove: 6,
    Marte: 4, Venere: 3, Mercurio: 2, Sole: 5, Luna: 1,
  };

  for (const transit of currentTransits) {
    for (const natal of natalPlanets) {
      // Skip same planet (Sun transit to natal Sun is always conjunct in birthday month)
      if (transit.planet === natal.name) continue;

      // Use actual transit degree; natal planets only have sign-level precision
      // so use sign midpoint (15° into the sign) for natal
      const transitDeg = transit.degree;
      const natalDeg = signStartDegree(natal.sign) + 15;
      const aspect = calculateAspect(transitDeg, natalDeg);

      if (aspect) {
        const aspectSymbol = ASPECTS[aspect.type].symbol;
        const description = `${transit.planet} ${aspectSymbol} il tuo ${natal.name}`;
        results.push({
          transitPlanet: transit.planet,
          aspect: aspect.type,
          natalPlanet: natal.name,
          description,
          weight: (planetWeight[transit.planet] || 1) + (10 - aspect.exact * 2),
        });
      }
    }
  }

  // Sort by significance and return top 3
  results.sort((a, b) => b.weight - a.weight);
  return results.slice(0, 3).map(({ weight: _w, ...rest }) => rest);
}

// Lunar phases 2026-2027 (approximate dates)
// Source: astronomical calculations, ±1 day accuracy
export const LUNAR_PHASES = [
  // 2026
  { date: "2026-01-12", phase: "new_moon" as const, sign: "Capricorno" },
  { date: "2026-01-27", phase: "full_moon" as const, sign: "Leone" },
  { date: "2026-02-10", phase: "new_moon" as const, sign: "Acquario" },
  { date: "2026-02-25", phase: "full_moon" as const, sign: "Vergine" },
  { date: "2026-03-12", phase: "new_moon" as const, sign: "Pesci" },
  { date: "2026-03-27", phase: "full_moon" as const, sign: "Bilancia" },
  { date: "2026-04-11", phase: "new_moon" as const, sign: "Ariete" },
  { date: "2026-04-26", phase: "full_moon" as const, sign: "Scorpione" },
  { date: "2026-05-10", phase: "new_moon" as const, sign: "Toro" },
  { date: "2026-05-25", phase: "full_moon" as const, sign: "Sagittario" },
  { date: "2026-06-09", phase: "new_moon" as const, sign: "Gemelli" },
  { date: "2026-06-24", phase: "full_moon" as const, sign: "Capricorno" },
  { date: "2026-07-08", phase: "new_moon" as const, sign: "Cancro" },
  { date: "2026-07-23", phase: "full_moon" as const, sign: "Acquario" },
  { date: "2026-08-07", phase: "new_moon" as const, sign: "Leone" },
  { date: "2026-08-22", phase: "full_moon" as const, sign: "Pesci" },
  { date: "2026-09-05", phase: "new_moon" as const, sign: "Vergine" },
  { date: "2026-09-20", phase: "full_moon" as const, sign: "Ariete" },
  { date: "2026-10-05", phase: "new_moon" as const, sign: "Bilancia" },
  { date: "2026-10-20", phase: "full_moon" as const, sign: "Toro" },
  { date: "2026-11-03", phase: "new_moon" as const, sign: "Scorpione" },
  { date: "2026-11-18", phase: "full_moon" as const, sign: "Gemelli" },
  { date: "2026-12-03", phase: "new_moon" as const, sign: "Sagittario" },
  { date: "2026-12-18", phase: "full_moon" as const, sign: "Cancro" },
  // 2027
  { date: "2027-01-01", phase: "new_moon" as const, sign: "Capricorno" },
  { date: "2027-01-16", phase: "full_moon" as const, sign: "Cancro" },
  { date: "2027-01-31", phase: "new_moon" as const, sign: "Acquario" },
  { date: "2027-02-14", phase: "full_moon" as const, sign: "Leone" },
  { date: "2027-03-01", phase: "new_moon" as const, sign: "Pesci" },
  { date: "2027-03-16", phase: "full_moon" as const, sign: "Vergine" },
  { date: "2027-03-31", phase: "new_moon" as const, sign: "Ariete" },
  { date: "2027-04-15", phase: "full_moon" as const, sign: "Bilancia" },
  { date: "2027-04-29", phase: "new_moon" as const, sign: "Toro" },
  { date: "2027-05-14", phase: "full_moon" as const, sign: "Scorpione" },
  { date: "2027-05-29", phase: "new_moon" as const, sign: "Gemelli" },
  { date: "2027-06-13", phase: "full_moon" as const, sign: "Sagittario" },
  { date: "2027-06-28", phase: "new_moon" as const, sign: "Cancro" },
  { date: "2027-07-12", phase: "full_moon" as const, sign: "Capricorno" },
  { date: "2027-07-27", phase: "new_moon" as const, sign: "Leone" },
  { date: "2027-08-10", phase: "full_moon" as const, sign: "Acquario" },
  { date: "2027-08-26", phase: "new_moon" as const, sign: "Vergine" },
  { date: "2027-09-09", phase: "full_moon" as const, sign: "Pesci" },
  { date: "2027-09-25", phase: "new_moon" as const, sign: "Bilancia" },
  { date: "2027-10-08", phase: "full_moon" as const, sign: "Ariete" },
  { date: "2027-10-24", phase: "new_moon" as const, sign: "Scorpione" },
  { date: "2027-11-07", phase: "full_moon" as const, sign: "Toro" },
  { date: "2027-11-23", phase: "new_moon" as const, sign: "Sagittario" },
  { date: "2027-12-07", phase: "full_moon" as const, sign: "Gemelli" },
  { date: "2027-12-22", phase: "new_moon" as const, sign: "Capricorno" },
] as const;

// Get current lunar event if we're within ±1 day of a new/full moon
export function getCurrentLunarEvent(): {
  phase: "new_moon" | "full_moon";
  sign: string;
  date: string;
} | null {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (const event of LUNAR_PHASES) {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0);

    const diffDays = Math.abs(
      (now.getTime() - eventDate.getTime()) / 86400000
    );

    // Show card 2 days before + day of + 1 day after (total window = ±2 days)
    if (diffDays <= 2) {
      return { phase: event.phase, sign: event.sign, date: event.date };
    }
  }

  return null;
}

// Get current Moon transit sign (rough approximation)
export function getCurrentMoonSign(): string {
  const transits = getCurrentTransits();
  const moon = transits.find((t) => t.planet === "Luna");
  return moon?.sign || "Ariete";
}
