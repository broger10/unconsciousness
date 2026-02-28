"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Phase = "mood" | "energy" | "cosmic" | "reflection" | "insight";

const moodOpts = [
  { v: 1, e: "&#9681;", l: "Pesante" },
  { v: 2, e: "&#9676;", l: "Bassa" },
  { v: 3, e: "&#9672;", l: "Neutra" },
  { v: 4, e: "&#9670;", l: "Buona" },
  { v: 5, e: "&#10038;", l: "Radiante" },
];

const energyOpts = [
  { v: 1, e: "&#9676;", l: "Vuota" },
  { v: 2, e: "&#9670;", l: "Bassa" },
  { v: 3, e: "&#9672;", l: "Media" },
  { v: 4, e: "&#10038;", l: "Alta" },
  { v: 5, e: "&#9733;", l: "Stellare" },
];

const cosmicOpts = [
  { v: 1, e: "&#9679;", l: "Disconnessa" },
  { v: 2, e: "&#9681;", l: "Confusa" },
  { v: 3, e: "&#9680;", l: "In ascolto" },
  { v: 4, e: "&#9670;", l: "Allineata" },
  { v: 5, e: "&#10038;", l: "In flusso" },
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
    fetch("/api/checkin").then((r) => r.json()).then((d) => { if (d.streak) setStreak(d.streak); }).catch(() => {});
  }, []);

  const submitCheckin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mood, energy, cosmicEnergy, reflection }) });
      const data = await res.json();
      setInsight(data.insight || "");
      setPhase("insight");
    } catch { /* */ } finally { setLoading(false); }
  };

  const renderSelector = (opts: { v: number; e: string; l: string }[], selected: number, onSelect: (v: number) => void) => (
    <div className="flex justify-center gap-3 md:gap-4">
      {opts.map((o) => (
        <button key={o.v} onClick={() => onSelect(o.v)} className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-300 ${
          selected === o.v ? "glass glow scale-110" : "hover:bg-bg-glass"
        }`}>
          <span className={`text-3xl md:text-4xl ${selected === o.v ? "text-amber" : "text-text-muted"} transition-all`} dangerouslySetInnerHTML={{ __html: o.e }} />
          <span className={`text-xs font-ui ${selected === o.v ? "text-amber" : "text-text-muted"}`}>{o.l}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="fixed inset-0 alchemy-bg pointer-events-none opacity-20" />
      <div className="w-full max-w-lg mx-auto relative z-10">
        {streak > 0 && phase !== "insight" && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <span className="glass rounded-full px-4 py-2 text-sm text-amber font-ui">&#9670; {streak} giorni di fila</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {phase === "mood" && (
            <motion.div key="mood" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <div className="text-4xl mb-4 text-amber">&#9790;</div>
              <h2 className="text-2xl font-bold font-display mb-2">Rituale Cosmico</h2>
              <p className="text-text-secondary mb-8 font-body italic text-lg">Come ti senti in questo momento?</p>
              {renderSelector(moodOpts, mood, setMood)}
              <div className="mt-8"><Button onClick={() => setPhase("energy")} disabled={mood === 0}>Avanti &#8594;</Button></div>
            </motion.div>
          )}
          {phase === "energy" && (
            <motion.div key="energy" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <h2 className="text-2xl font-bold font-display mb-2">La tua energia</h2>
              <p className="text-text-secondary mb-8 font-body italic text-lg">Quanta energia hai oggi?</p>
              {renderSelector(energyOpts, energy, setEnergy)}
              <div className="mt-8 flex gap-3 justify-center">
                <Button variant="ghost" onClick={() => setPhase("mood")}>&#8592;</Button>
                <Button onClick={() => setPhase("cosmic")} disabled={energy === 0}>Avanti &#8594;</Button>
              </div>
            </motion.div>
          )}
          {phase === "cosmic" && (
            <motion.div key="cosmic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <h2 className="text-2xl font-bold font-display mb-2">Allineamento cosmico</h2>
              <p className="text-text-secondary mb-8 font-body italic text-lg">Quanto ti senti in sintonia con il cosmo?</p>
              {renderSelector(cosmicOpts, cosmicEnergy, setCosmicEnergy)}
              <div className="mt-8 flex gap-3 justify-center">
                <Button variant="ghost" onClick={() => setPhase("energy")}>&#8592;</Button>
                <Button onClick={() => setPhase("reflection")} disabled={cosmicEnergy === 0}>Avanti &#8594;</Button>
              </div>
            </motion.div>
          )}
          {phase === "reflection" && (
            <motion.div key="reflection" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
              <h2 className="text-2xl font-bold font-display mb-2">Riflessione cosmica</h2>
              <p className="text-text-secondary mb-6 font-body italic text-lg">C&apos;è qualcosa che le stelle dovrebbero sapere?</p>
              <Textarea value={reflection} onChange={(e) => setReflection(e.target.value)} placeholder="Scrivi liberamente..." rows={4} />
              <div className="mt-6 flex gap-3 justify-center">
                <Button variant="ghost" onClick={() => setPhase("cosmic")}>&#8592;</Button>
                <Button onClick={submitCheckin} disabled={loading} className="breathe">
                  {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin" /> L&apos;oracolo risponde...</span> : "Ricevi l'insight"}
                </Button>
              </div>
            </motion.div>
          )}
          {phase === "insight" && (
            <motion.div key="insight" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.3 }} className="text-5xl mb-6 text-amber">&#9670;</motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-2xl p-8 glow mb-8">
                <h3 className="text-xs text-amber mb-4 font-ui tracking-wider">IL COSMO TI DICE</h3>
                <p className="text-text-primary leading-relaxed italic text-lg font-body">&ldquo;{insight}&rdquo;</p>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <a href="/dashboard"><Button variant="ghost">Torna allo specchio</Button></a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
