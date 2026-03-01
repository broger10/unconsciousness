"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────
interface ChartData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
}

interface OnboardingFlowProps {
  userName: string;
}

const ZODIAC_SYMBOL: Record<string, string> = {
  Ariete: "♈", Toro: "♉", Gemelli: "♊", Cancro: "♋",
  Leone: "♌", Vergine: "♍", Bilancia: "♎", Scorpione: "♏",
  Sagittario: "♐", Capricorno: "♑", Acquario: "♒", Pesci: "♓",
};

// ─── Main Flow ────────────────────────────────────────
export function OnboardingFlow({ userName }: OnboardingFlowProps) {
  const [step, setStep] = useState(1);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [phrase, setPhrase] = useState("");
  const [completing, setCompleting] = useState(false);

  const handleBirthSubmit = async () => {
    if (!birthDate) return;
    setStep(3);
    const startTime = Date.now();

    try {
      // Calculate chart
      const chartRes = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate,
          birthTime: birthTime || "12:00",
          birthCity,
        }),
      });
      const chartResult = await chartRes.json();
      const chart = chartResult.chart;
      setChartData(chart);

      // Generate phrase (needs chart data first)
      const phraseRes = await fetch("/api/onboarding/phrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sunSign: chart.sunSign,
          moonSign: chart.moonSign,
          risingSign: chart.risingSign,
        }),
      });
      const phraseResult = await phraseRes.json();
      setPhrase(phraseResult.phrase);

      // Ensure minimum 3.6s ritual time
      const elapsed = Date.now() - startTime;
      if (elapsed < 3600) {
        await new Promise((r) => setTimeout(r, 3600 - elapsed));
      }

      setStep(4);
    } catch {
      // If something fails, go back to step 2
      setStep(2);
    }
  };

  const handleComplete = async () => {
    if (completing) return;
    setCompleting(true);
    try {
      await fetch("/api/onboarding/complete", { method: "POST" });
      window.location.href = "/oggi";
    } catch {
      setCompleting(false);
    }
  };

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: "#0A1A0F" }}>
      {step === 1 && (
        <StepBenvenuto userName={userName} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <StepDatoSacro
          birthDate={birthDate}
          setBirthDate={setBirthDate}
          birthTime={birthTime}
          setBirthTime={setBirthTime}
          birthCity={birthCity}
          setBirthCity={setBirthCity}
          onSubmit={handleBirthSubmit}
        />
      )}
      {step === 3 && <StepCalcolo />}
      {step === 4 && chartData && (
        <StepRivelazione
          chart={chartData}
          phrase={phrase}
          onNext={() => setStep(5)}
        />
      )}
      {step === 5 && (
        <StepBussola onComplete={handleComplete} completing={completing} />
      )}
    </div>
  );
}

// ─── Step 1: Benvenuto ────────────────────────────────
function StepBenvenuto({
  userName,
  onNext,
}: {
  userName: string;
  onNext: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      {/* Star */}
      <div className="text-amber text-6xl onb-star-hero mb-8">✦</div>

      {/* Title + body */}
      <div className="onb-fade-in text-center" style={{ animationDelay: "0.8s" }}>
        <h1 className="font-display text-[clamp(40px,10vw,56px)] font-bold leading-[1.1] text-text-primary">
          Ciao, {userName}.
        </h1>
        <p className="font-body text-[17px] text-text-primary italic text-center max-w-[280px] mx-auto mt-4 leading-relaxed">
          Sei qui perché una parte di te sa che c&apos;è qualcosa da capire.
        </p>
      </div>

      {/* Button */}
      <div
        className="absolute bottom-12 left-0 right-0 flex justify-center onb-fade-in"
        style={{ animationDelay: "1.5s" }}
      >
        <button
          onClick={onNext}
          className="bg-amber text-bg-base px-8 py-3.5 rounded-xl font-ui font-semibold text-base shadow-lg shadow-amber/20 hover:bg-amber-glow transition-colors"
        >
          Inizia ✦
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Il Dato Sacro ────────────────────────────
function StepDatoSacro({
  birthDate,
  setBirthDate,
  birthTime,
  setBirthTime,
  birthCity,
  setBirthCity,
  onSubmit,
}: {
  birthDate: string;
  setBirthDate: (v: string) => void;
  birthTime: string;
  setBirthTime: (v: string) => void;
  birthCity: string;
  setBirthCity: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-10 onb-fade-in">
          <p className="text-[11px] text-text-primary/70 font-ui tracking-[0.2em] uppercase mb-4">
            Il tuo tema natale
          </p>
          <h2 className="font-display text-[clamp(24px,6vw,36px)] font-semibold leading-[1.2] text-text-primary">
            Il cosmo ha una fotografia del momento esatto in cui sei arrivata/o.
          </h2>
          <p className="font-body text-[17px] text-text-primary italic mt-3 leading-relaxed">
            Data, ora e luogo di nascita. Più sei precisa/o, più lo specchio è nitido.
          </p>
        </div>

        {/* Fields */}
        <div className="space-y-6 onb-fade-in" style={{ animationDelay: "0.3s" }}>
          {/* Birth date */}
          <div>
            <label className="text-[11px] text-amber font-ui tracking-[0.15em] uppercase block mb-2">
              Quando
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border text-text-primary font-ui focus:outline-none focus:border-amber/40 transition-colors"
            />
          </div>

          {/* Birth time */}
          <div>
            <label className="text-[11px] text-amber font-ui tracking-[0.15em] uppercase block mb-2">
              A che ora
            </label>
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border text-text-primary font-ui focus:outline-none focus:border-amber/40 transition-colors"
            />
            <p className="text-[12px] text-text-muted/60 font-ui mt-1.5">
              Non la sai? Metti 12:00 — funziona lo stesso.
            </p>
          </div>

          {/* Birth city */}
          <div>
            <label className="text-[11px] text-amber font-ui tracking-[0.15em] uppercase block mb-2">
              Dove
            </label>
            <input
              type="text"
              value={birthCity}
              onChange={(e) => setBirthCity(e.target.value)}
              placeholder="es. Milano, Roma, Napoli..."
              className="w-full px-4 py-3 rounded-xl bg-bg-surface border border-border text-text-primary placeholder:text-text-muted font-ui focus:outline-none focus:border-amber/40 transition-colors"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="mt-8 onb-fade-in" style={{ animationDelay: "0.5s" }}>
          <button
            onClick={onSubmit}
            disabled={!birthDate}
            className="w-full bg-amber text-bg-base py-3.5 rounded-xl font-ui font-semibold text-base shadow-lg shadow-amber/20 hover:bg-amber-glow transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Crea il mio tema ✦
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Il Tema Si Crea ──────────────────────────
function StepCalcolo() {
  // Generate random star positions once
  const stars = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        delay: `${(Math.random() * 2.5).toFixed(1)}s`,
        size: Math.random() > 0.7 ? "1.5px" : "1px",
      })),
    []
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Stars background */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-amber/40 onb-star-dot"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      {/* Loading lines */}
      <div className="relative z-10 text-center space-y-6">
        <p
          className="font-body text-[17px] text-text-primary italic onb-fade-in"
          style={{ animationDelay: "0s" }}
        >
          Calcolando le posizioni planetarie...
        </p>
        <p
          className="font-body text-[17px] text-text-primary italic onb-fade-in"
          style={{ animationDelay: "1.2s" }}
        >
          Il cosmo stava aspettando questo momento.
        </p>
        <p
          className="font-body text-[17px] text-text-primary italic onb-fade-in"
          style={{ animationDelay: "2.4s" }}
        >
          Quasi pronto.
        </p>
      </div>
    </div>
  );
}

// ─── Step 4: La Prima Rivelazione ─────────────────────
function StepRivelazione({
  chart,
  phrase,
  onNext,
}: {
  chart: ChartData;
  phrase: string;
  onNext: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Label */}
        <p className="text-[11px] text-text-muted font-ui tracking-[0.2em] uppercase mb-8 onb-fade-in">
          Il tuo specchio
        </p>

        {/* Three signs */}
        <div className="flex items-center justify-center gap-8 mb-8 onb-fade-in" style={{ animationDelay: "0.2s" }}>
          {[
            { symbol: "☀️", label: "SOLE", sign: chart.sunSign },
            { symbol: "🌙", label: "LUNA", sign: chart.moonSign },
            { symbol: "↑", label: "ASCENDENTE", sign: chart.risingSign },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-2xl mb-1">{item.symbol}</div>
              <div className="text-[10px] text-text-muted font-ui tracking-[0.1em]">
                {item.label}
              </div>
              <div className="font-display text-amber text-xl font-semibold mt-0.5">
                {ZODIAC_SYMBOL[item.sign] || ""} {item.sign}
              </div>
            </div>
          ))}
        </div>

        {/* Separator */}
        <div
          className="w-16 h-px bg-amber/30 mx-auto mb-8 onb-fade-in"
          style={{ animationDelay: "0.4s" }}
        />

        {/* Personalized phrase */}
        {phrase && (
          <p
            className="font-display text-[clamp(20px,5vw,24px)] italic text-text-primary leading-snug max-w-sm mx-auto onb-fade-in"
            style={{ animationDelay: "0.7s" }}
          >
            {phrase}
          </p>
        )}

        {/* Button */}
        <div
          className="mt-12 onb-fade-in"
          style={{ animationDelay: "1.2s" }}
        >
          <button
            onClick={onNext}
            className="bg-amber text-bg-base px-8 py-3.5 rounded-xl font-ui font-semibold text-base shadow-lg shadow-amber/20 hover:bg-amber-glow transition-colors"
          >
            È davvero così ✦
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: La Bussola ───────────────────────────────
function StepBussola({
  onComplete,
  completing,
}: {
  onComplete: () => void;
  completing: boolean;
}) {
  const features = [
    {
      icon: "◆",
      title: "OGGI",
      text: "La tua frase del giorno. Il tuo cielo. Ogni mattina.",
      color: "text-amber",
    },
    {
      icon: "◇",
      title: "MAPPA",
      text: "I tuoi 10 pianeti. Chi sei sotto la superficie.",
      color: "text-verdigris",
    },
    {
      icon: "✦",
      title: "ORACOLO",
      text: "Fai una domanda. Le stelle conoscono già la risposta.",
      color: "text-amber",
    },
    {
      icon: "🌙",
      title: "DIARIO",
      text: "Scrivi. L'AI trova i pattern che tu non vedi.",
      color: "text-amber-glow",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md mx-auto">
        {/* Feature list */}
        <div className="space-y-7">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="flex items-start gap-4 onb-fade-in"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <span className={`text-xl ${f.color} shrink-0 w-7 text-center`}>
                {f.icon}
              </span>
              <div>
                <div className="text-[11px] text-amber font-ui tracking-[0.15em] uppercase">
                  {f.title}
                </div>
                <p className="font-body text-[15px] text-text-primary mt-0.5 leading-relaxed">
                  {f.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="mt-12 onb-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <button
            onClick={onComplete}
            disabled={completing}
            className="w-full bg-amber text-bg-base py-4 rounded-xl font-ui font-semibold text-lg shadow-lg shadow-amber/20 hover:bg-amber-glow transition-colors disabled:opacity-60"
          >
            {completing ? "..." : "Entra nel cosmo ✦"}
          </button>
        </div>
      </div>
    </div>
  );
}
