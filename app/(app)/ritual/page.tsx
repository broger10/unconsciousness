"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Phase = "mood" | "energy" | "cosmic" | "reflection" | "insight";

const moodOptions = [
  { value: 1, emoji: "😔", label: "Pesante" },
  { value: 2, emoji: "😕", label: "Bassa" },
  { value: 3, emoji: "😐", label: "Neutra" },
  { value: 4, emoji: "🌤", label: "Buona" },
  { value: 5, emoji: "✨", label: "Radiante" },
];

const energyOptions = [
  { value: 1, emoji: "🔋", label: "Vuota" },
  { value: 2, emoji: "🪫", label: "Bassa" },
  { value: 3, emoji: "⚡", label: "Media" },
  { value: 4, emoji: "🔥", label: "Alta" },
  { value: 5, emoji: "💫", label: "Stellare" },
];

const cosmicOptions = [
  { value: 1, emoji: "🌑", label: "Disconnessa" },
  { value: 2, emoji: "🌒", label: "Confusa" },
  { value: 3, emoji: "🌓", label: "In ascolto" },
  { value: 4, emoji: "🌔", label: "Allineata" },
  { value: 5, emoji: "🌕", label: "In flusso" },
];

export default function RitualPage() {
  const [phase, setPhase] = useState<Phase>("mood");
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [cosmicEnergy, setCosmicEnergy] = useState(0);
  const [reflection, setReflection] = useState("");
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    fetch("/api/checkin")
      .then((r) => r.json())
      .then((data) => {
        if (data.streak) setStreak(data.streak);
      })
      .catch(() => {});
  }, []);

  const submitCheckin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, energy, cosmicEnergy, reflection }),
      });
      const data = await res.json();
      setInsight(data.insight || "");
      setPhase("insight");
    } catch {
      console.error("Error submitting checkin");
    } finally {
      setLoading(false);
    }
  };

  const renderSelector = (
    options: { value: number; emoji: string; label: string }[],
    selected: number,
    onSelect: (v: number) => void
  ) => (
    <div className="flex justify-center gap-3 md:gap-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onSelect(opt.value)}
          className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 ${
            selected === opt.value
              ? "glass glow scale-110"
              : "hover:bg-bg-glass"
          }`}
        >
          <span className={`text-3xl md:text-4xl ${selected === opt.value ? "" : "grayscale opacity-50"} transition-all`}>
            {opt.emoji}
          </span>
          <span className={`text-xs ${selected === opt.value ? "text-accent" : "text-text-muted"}`}>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-20" />

      <div className="w-full max-w-lg mx-auto relative z-10">
        {/* Streak */}
        {streak > 0 && phase !== "insight" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <span className="glass rounded-full px-4 py-2 text-sm text-accent">
              🔥 {streak} giorni di fila
            </span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* MOOD */}
          {phase === "mood" && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <div className="text-4xl mb-4">🌙</div>
              <h2 className="text-2xl font-bold mb-2">Rituale Cosmico</h2>
              <p className="text-text-secondary mb-8">Come ti senti in questo momento?</p>

              {renderSelector(moodOptions, mood, setMood)}

              <div className="mt-8">
                <Button
                  onClick={() => setPhase("energy")}
                  disabled={mood === 0}
                  className="px-8"
                >
                  Avanti →
                </Button>
              </div>
            </motion.div>
          )}

          {/* ENERGY */}
          {phase === "energy" && (
            <motion.div
              key="energy"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-2">La tua energia</h2>
              <p className="text-text-secondary mb-8">Quanta energia hai oggi?</p>

              {renderSelector(energyOptions, energy, setEnergy)}

              <div className="mt-8 flex gap-3 justify-center">
                <Button variant="ghost" onClick={() => setPhase("mood")}>← Indietro</Button>
                <Button onClick={() => setPhase("cosmic")} disabled={energy === 0}>
                  Avanti →
                </Button>
              </div>
            </motion.div>
          )}

          {/* COSMIC ALIGNMENT */}
          {phase === "cosmic" && (
            <motion.div
              key="cosmic"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-2">Allineamento cosmico</h2>
              <p className="text-text-secondary mb-8">Quanto ti senti in sintonia con il cosmo?</p>

              {renderSelector(cosmicOptions, cosmicEnergy, setCosmicEnergy)}

              <div className="mt-8 flex gap-3 justify-center">
                <Button variant="ghost" onClick={() => setPhase("energy")}>← Indietro</Button>
                <Button onClick={() => setPhase("reflection")} disabled={cosmicEnergy === 0}>
                  Avanti →
                </Button>
              </div>
            </motion.div>
          )}

          {/* REFLECTION */}
          {phase === "reflection" && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center"
            >
              <h2 className="text-2xl font-bold mb-2">Riflessione cosmica</h2>
              <p className="text-text-secondary mb-6">
                C&apos;è qualcosa che le stelle dovrebbero sapere di oggi?
              </p>

              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Scrivi liberamente... o lascia vuoto"
                rows={4}
              />

              <div className="mt-6 flex gap-3 justify-center">
                <Button variant="ghost" onClick={() => setPhase("cosmic")}>← Indietro</Button>
                <Button onClick={submitCheckin} disabled={loading} className="cosmic-breathe">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      L&apos;oracolo risponde...
                    </span>
                  ) : (
                    "Ricevi l'insight cosmico"
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* INSIGHT */}
          {phase === "insight" && (
            <motion.div
              key="insight"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.3 }}
                className="text-6xl mb-6"
              >
                ✦
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass rounded-2xl p-8 glow mb-8"
              >
                <h3 className="text-sm font-medium text-accent mb-4">Il cosmo ti dice</h3>
                <p className="text-text-secondary leading-relaxed italic text-lg">
                  &ldquo;{insight}&rdquo;
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <a href="/dashboard">
                  <Button variant="ghost">Torna allo specchio</Button>
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
