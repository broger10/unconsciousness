"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

const moodEmojis = [
  { value: 1, emoji: "😞", label: "Basso" },
  { value: 2, emoji: "😕", label: "Giù" },
  { value: 3, emoji: "😐", label: "Neutro" },
  { value: 4, emoji: "🙂", label: "Bene" },
  { value: 5, emoji: "😊", label: "Ottimo" },
];

const energyLevels = [
  { value: 1, emoji: "🔋", label: "Scarico" },
  { value: 2, emoji: "🪫", label: "Basso" },
  { value: 3, emoji: "⚡", label: "Medio" },
  { value: 4, emoji: "💪", label: "Alto" },
  { value: 5, emoji: "🚀", label: "Esplosivo" },
];

type Step = "mood" | "energy" | "reflection" | "insight";

interface Checkin {
  mood: number;
  energy: number;
  aiInsight: string | null;
  createdAt: string;
}

export default function RitualPage() {
  const [step, setStep] = useState<Step>("mood");
  const [mood, setMood] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState("");
  const [recentCheckins, setRecentCheckins] = useState<Checkin[]>([]);

  useEffect(() => {
    fetch("/api/checkin")
      .then((r) => r.json())
      .then((data) => setRecentCheckins(data.checkins || []))
      .catch(() => {});
  }, []);

  async function handleSubmit() {
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood,
          energy,
          responses: { reflection },
        }),
      });
      const data = await res.json();
      setInsight(data.checkin.aiInsight || "");
      setStep("insight");
    } catch {
      // handle error
    }
    setLoading(false);
  }

  const today = new Date().toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Il Rituale</h1>
        <p className="text-text-secondary capitalize">{today}</p>
      </motion.div>

      {/* Streak */}
      {recentCheckins.length > 0 && step === "mood" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Card variant="glass" className="text-center py-4">
            <div className="flex items-center justify-center gap-1 mb-2">
              {Array.from({ length: Math.min(recentCheckins.length, 7) }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full bg-accent shadow-[0_0_6px_rgba(99,102,241,0.4)]"
                />
              ))}
              {Array.from({ length: Math.max(0, 7 - recentCheckins.length) }).map((_, i) => (
                <div key={`empty-${i}`} className="w-3 h-3 rounded-full bg-bg-tertiary" />
              ))}
            </div>
            <p className="text-xs text-text-muted">
              {recentCheckins.length} check-in questa settimana
            </p>
          </Card>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {/* Mood */}
        {step === "mood" && (
          <motion.div
            key="mood"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <Card variant="glass" className="py-10">
              <h2 className="text-xl font-semibold mb-2">Come ti senti?</h2>
              <p className="text-text-muted text-sm mb-8">
                Non pensarci troppo. La prima risposta è quella giusta.
              </p>
              <div className="flex items-center justify-center gap-4">
                {moodEmojis.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => {
                      setMood(m.value);
                      setStep("energy");
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 hover:bg-bg-glass hover:scale-110 cursor-pointer ${
                      mood === m.value ? "bg-accent/10 scale-110" : ""
                    }`}
                  >
                    <span className="text-4xl">{m.emoji}</span>
                    <span className="text-xs text-text-muted">{m.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Energy */}
        {step === "energy" && (
          <motion.div
            key="energy"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="text-center"
          >
            <Card variant="glass" className="py-10">
              <h2 className="text-xl font-semibold mb-2">Quanta energia hai?</h2>
              <p className="text-text-muted text-sm mb-8">
                Ascolta il tuo corpo.
              </p>
              <div className="flex items-center justify-center gap-4">
                {energyLevels.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => {
                      setEnergy(e.value);
                      setStep("reflection");
                    }}
                    className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 hover:bg-bg-glass hover:scale-110 cursor-pointer"
                  >
                    <span className="text-4xl">{e.emoji}</span>
                    <span className="text-xs text-text-muted">{e.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Reflection */}
        {step === "reflection" && (
          <motion.div
            key="reflection"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Card variant="glass" className="py-8">
              <h2 className="text-xl font-semibold mb-2 text-center">
                Una riflessione veloce
              </h2>
              <p className="text-text-muted text-sm mb-6 text-center">
                Cosa occupa la tua mente in questo momento? Anche una frase va bene.
              </p>
              <Textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Scrivi quello che ti viene in mente..."
                rows={4}
                className="mb-4"
              />
              <div className="flex justify-end">
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Analizzo...
                    </span>
                  ) : (
                    "Scopri il tuo insight"
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Insight */}
        {step === "insight" && (
          <motion.div
            key="insight"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card variant="glow" className="py-10 px-8">
              <div className="text-5xl mb-6">💡</div>
              <h2 className="text-xl font-semibold mb-4">Il tuo insight di oggi</h2>
              <p className="text-text-secondary leading-relaxed text-lg max-w-lg mx-auto">
                {insight || "Continua con i check-in per ricevere insight sempre più profondi."}
              </p>

              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-text-muted">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{moodEmojis[mood - 1]?.emoji}</span>
                  Mood: {mood}/5
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{energyLevels[energy - 1]?.emoji}</span>
                  Energia: {energy}/5
                </div>
              </div>
            </Card>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <Button
                variant="ghost"
                onClick={() => {
                  setStep("mood");
                  setMood(0);
                  setEnergy(0);
                  setReflection("");
                  setInsight("");
                }}
              >
                Fatto. Ci vediamo domani.
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
