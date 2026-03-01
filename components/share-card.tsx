"use client";

import { forwardRef } from "react";

// ─── Frase del Giorno Card ──────────────────────────
export interface FraseCardProps {
  frase: string;
  sunSign: string;
  moonSign: string;
  risingSign: string;
  date: string;
}

export const FraseShareCard = forwardRef<HTMLDivElement, FraseCardProps>(
  ({ frase, sunSign, moonSign, risingSign, date }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1920,
          background: "#0A1A0F",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        {/* Star field */}
        <StarField />

        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "200px 80px",
            textAlign: "center",
          }}
        >
          {/* Date */}
          <p
            style={{
              fontFamily: "'Syne', system-ui, sans-serif",
              fontSize: 24,
              color: "rgba(90,122,92,0.8)",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 48,
            }}
          >
            {date}
          </p>

          {/* Signs trio */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 40,
              marginBottom: 80,
            }}
          >
            <SignBadge symbol="☉" label="Sole" sign={sunSign} />
            <span style={{ color: "rgba(201,168,76,0.25)", fontSize: 16 }}>
              ✦
            </span>
            <SignBadge symbol="☽" label="Luna" sign={moonSign} />
            <span style={{ color: "rgba(201,168,76,0.25)", fontSize: 16 }}>
              ✦
            </span>
            <SignBadge symbol="↑" label="Asc" sign={risingSign} />
          </div>

          {/* Upper ornament */}
          <div
            style={{
              color: "rgba(201,168,76,0.35)",
              fontSize: 28,
              marginBottom: 60,
            }}
          >
            ✦
          </div>

          {/* The phrase */}
          <p
            style={{
              fontSize: 72,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#C9A84C",
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            {frase}
          </p>

          {/* Lower ornament */}
          <div
            style={{
              color: "rgba(201,168,76,0.35)",
              fontSize: 28,
              marginTop: 60,
            }}
          >
            ✦
          </div>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 22,
              color: "rgba(201,168,76,0.3)",
              letterSpacing: "0.2em",
            }}
          >
            unconsciousness
          </p>
        </div>
      </div>
    );
  }
);

FraseShareCard.displayName = "FraseShareCard";

// ─── Compatibility Card ─────────────────────────────
export interface CompatCardProps {
  person1Name: string;
  person1Sun: string;
  person2Name: string;
  person2Sun: string;
  highlightQuote: string;
}

export const CompatShareCard = forwardRef<HTMLDivElement, CompatCardProps>(
  ({ person1Name, person1Sun, person2Name, person2Sun, highlightQuote }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1920,
          background: "#0A1A0F",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        <StarField />

        {/* Dual glow */}
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "30%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(74,155,142,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "30%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "200px 80px",
            textAlign: "center",
          }}
        >
          {/* Label */}
          <p
            style={{
              fontFamily: "'Syne', system-ui, sans-serif",
              fontSize: 22,
              color: "rgba(90,122,92,0.8)",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 64,
            }}
          >
            Compatibilità cosmica
          </p>

          {/* Two people */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 48,
              marginBottom: 80,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: 48,
                  marginBottom: 8,
                }}
              >
                {ZODIAC_EMOJI[person1Sun] || "☉"}
              </p>
              <p
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  color: "#C9A84C",
                }}
              >
                {person1Name}
              </p>
              <p
                style={{
                  fontFamily: "'Syne', system-ui, sans-serif",
                  fontSize: 20,
                  color: "rgba(139,175,141,0.8)",
                  marginTop: 4,
                }}
              >
                {person1Sun}
              </p>
            </div>

            <span
              style={{
                fontSize: 36,
                color: "rgba(201,168,76,0.3)",
              }}
            >
              ✦
            </span>

            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: 48, marginBottom: 8 }}>
                {ZODIAC_EMOJI[person2Sun] || "☉"}
              </p>
              <p
                style={{
                  fontSize: 30,
                  fontWeight: 600,
                  color: "#4A9B8E",
                }}
              >
                {person2Name}
              </p>
              <p
                style={{
                  fontFamily: "'Syne', system-ui, sans-serif",
                  fontSize: 20,
                  color: "rgba(139,175,141,0.8)",
                  marginTop: 4,
                }}
              >
                {person2Sun}
              </p>
            </div>
          </div>

          {/* Ornament */}
          <div style={{ width: 80, height: 1, background: "rgba(201,168,76,0.2)", marginBottom: 60 }} />

          {/* Highlight quote */}
          <p
            style={{
              fontSize: 56,
              fontWeight: 700,
              fontStyle: "italic",
              color: "#F0E6C8",
              lineHeight: 1.2,
              maxWidth: 860,
            }}
          >
            &ldquo;{highlightQuote}&rdquo;
          </p>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 22,
              color: "rgba(201,168,76,0.3)",
              letterSpacing: "0.2em",
            }}
          >
            unconsciousness
          </p>
        </div>
      </div>
    );
  }
);

CompatShareCard.displayName = "CompatShareCard";

// ─── Transit Alert Card ─────────────────────────────
export interface TransitCardProps {
  eventName: string;
  eventSign: string;
  personalMeaning: string;
  userSunSign: string;
}

export const TransitShareCard = forwardRef<HTMLDivElement, TransitCardProps>(
  ({ eventName, eventSign, personalMeaning, userSunSign }, ref) => {
    const isNewMoon = eventName.toLowerCase().includes("nuova");

    return (
      <div
        ref={ref}
        style={{
          width: 1080,
          height: 1920,
          background: "#0A1A0F",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        <StarField />

        {/* Event glow */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: isNewMoon
              ? "radial-gradient(circle, rgba(74,155,142,0.1) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(212,184,122,0.1) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: "200px 80px",
            textAlign: "center",
          }}
        >
          {/* Moon icon */}
          <p style={{ fontSize: 80, marginBottom: 40 }}>
            {isNewMoon ? "🌑" : "🌕"}
          </p>

          {/* Event name */}
          <p
            style={{
              fontFamily: "'Syne', system-ui, sans-serif",
              fontSize: 26,
              color: isNewMoon ? "#4A9B8E" : "#D4B87A",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 16,
            }}
          >
            {eventName}
          </p>

          {/* Event sign */}
          <p
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#F0E6C8",
              marginBottom: 64,
            }}
          >
            in {eventSign} {ZODIAC_EMOJI[eventSign] || ""}
          </p>

          {/* Ornament */}
          <div style={{ width: 60, height: 1, background: "rgba(201,168,76,0.25)", marginBottom: 60 }} />

          {/* Personal meaning */}
          <p
            style={{
              fontSize: 48,
              fontStyle: "italic",
              color: "#F0E6C8",
              lineHeight: 1.3,
              maxWidth: 840,
              marginBottom: 48,
            }}
          >
            {personalMeaning}
          </p>

          {/* User sign context */}
          <p
            style={{
              fontFamily: "'Syne', system-ui, sans-serif",
              fontSize: 22,
              color: "rgba(139,175,141,0.7)",
            }}
          >
            ☉ {userSunSign}
          </p>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            position: "absolute",
            bottom: 100,
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <p
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 22,
              color: "rgba(201,168,76,0.3)",
              letterSpacing: "0.2em",
            }}
          >
            unconsciousness
          </p>
        </div>
      </div>
    );
  }
);

TransitShareCard.displayName = "TransitShareCard";

// ─── Shared Components ──────────────────────────────
function SignBadge({
  symbol,
  label,
  sign,
}: {
  symbol: string;
  label: string;
  sign: string;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <p
        style={{
          fontFamily: "'Syne', system-ui, sans-serif",
          fontSize: 22,
          color: "rgba(139,175,141,0.7)",
          marginBottom: 4,
        }}
      >
        {symbol}
      </p>
      <p
        style={{
          fontFamily: "'Syne', system-ui, sans-serif",
          fontSize: 18,
          color: "rgba(90,122,92,0.6)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 28,
          fontWeight: 600,
          color: "#C9A84C",
        }}
      >
        {sign}
      </p>
    </div>
  );
}

function StarField() {
  // Deterministic star positions (no Math.random for SSR consistency)
  const stars = [
    { t: 5, l: 12, s: 2 }, { t: 8, l: 78, s: 1.5 }, { t: 15, l: 45, s: 1 },
    { t: 18, l: 92, s: 2 }, { t: 22, l: 28, s: 1.5 }, { t: 30, l: 67, s: 1 },
    { t: 35, l: 8, s: 2 }, { t: 38, l: 85, s: 1 }, { t: 42, l: 52, s: 1.5 },
    { t: 48, l: 18, s: 1 }, { t: 55, l: 73, s: 2 }, { t: 58, l: 38, s: 1 },
    { t: 62, l: 90, s: 1.5 }, { t: 68, l: 5, s: 1 }, { t: 72, l: 60, s: 2 },
    { t: 75, l: 25, s: 1.5 }, { t: 80, l: 82, s: 1 }, { t: 85, l: 42, s: 1.5 },
    { t: 88, l: 15, s: 2 }, { t: 92, l: 68, s: 1 }, { t: 95, l: 50, s: 1.5 },
    { t: 12, l: 55, s: 1 }, { t: 45, l: 35, s: 1.5 }, { t: 65, l: 48, s: 1 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {stars.map((star, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: `${star.t}%`,
            left: `${star.l}%`,
            width: star.s,
            height: star.s,
            borderRadius: "50%",
            background: `rgba(201,168,76,${0.15 + (i % 3) * 0.1})`,
          }}
        />
      ))}
    </div>
  );
}

const ZODIAC_EMOJI: Record<string, string> = {
  Ariete: "♈", Toro: "♉", Gemelli: "♊", Cancro: "♋",
  Leone: "♌", Vergine: "♍", Bilancia: "♎", Scorpione: "♏",
  Sagittario: "♐", Capricorno: "♑", Acquario: "♒", Pesci: "♓",
};
