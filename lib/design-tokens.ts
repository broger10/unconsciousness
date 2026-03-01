// Design tokens — single source of truth for the alchemical palette
// Runtime styling uses CSS custom properties in globals.css
// This file serves as TypeScript reference for components that need values programmatically

export const colors = {
  bgBase: "#0A1A0F",
  bgSurface: "#0F2415",
  bgCard: "#1A2E1C",
  gold: "#C9A84C",
  goldDim: "#A08540",
  goldGlow: "#D4B87A",
  cream: "#F0E6C8",
  teal: "#4A9B8E",
  tealDim: "#3A7A6A",
  red: "#C4614A",
  redDim: "#8B4530",
  textPrimary: "#F0E6C8",
  textSecondary: "#8BAF8D",
  textMuted: "#5A7A5C",
  border: "#1E3A22",
  borderLight: "#2A5030",
} as const;

export const typography = {
  display: { size: "clamp(36px, 8vw, 56px)", lineHeight: 1.1, weight: 700 },
  headline: { size: "clamp(24px, 5vw, 36px)", lineHeight: 1.2, weight: 600 },
  body: { size: "17px", lineHeight: 1.6, weight: 400 },
  caption: { size: "13px", lineHeight: 1.4, weight: 400 },
} as const;
