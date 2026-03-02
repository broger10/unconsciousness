"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CAPITOLI } from "@/lib/specchio-capitoli";

const premium = [0.16, 1, 0.3, 1] as const;

interface Domanda {
  domanda: string;
  risposte: string[];
}

interface RispostaSalvata {
  domanda: string;
  risposte: string[];
  risposta_scelta?: string;
  testo_libero?: string;
}

export function SessioneGiornaliera({
  capitoloId,
  capitoloSlug,
  giorno,
  onComplete,
}: {
  capitoloId: string;
  capitoloSlug: string;
  giorno: number;
  onComplete: (feedback: string, isUltimo: boolean) => void;
}) {
  const [domande, setDomande] = useState<Domanda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [risposte, setRisposte] = useState<RispostaSalvata[]>([]);
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [saving, setSaving] = useState(false);

  const cap = CAPITOLI[capitoloSlug];

  // Load questions on mount
  useEffect(() => {
    fetch("/api/specchio/sessione/genera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capitoloId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else if (d.domande) {
          setDomande(d.domande);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Le stelle stanno ancora leggendo. Riprova tra un momento.");
        setLoading(false);
      });
  }, [capitoloId]);

  const handleSelect = useCallback(
    (risposta: string) => {
      const domanda = domande[currentIndex];
      const nuovaRisposta: RispostaSalvata = {
        domanda: domanda.domanda,
        risposte: domanda.risposte,
        risposta_scelta: risposta,
      };

      const nuoveRisposte = [...risposte, nuovaRisposta];
      setRisposte(nuoveRisposte);
      setShowFreeText(false);
      setFreeText("");

      if (currentIndex < domande.length - 1) {
        setTimeout(() => setCurrentIndex((i) => i + 1), 400);
      } else {
        // Save session
        saveSession(nuoveRisposte);
      }
    },
    [currentIndex, domande, risposte]
  );

  const handleFreeTextSubmit = useCallback(() => {
    if (!freeText.trim()) return;

    const domanda = domande[currentIndex];
    const nuovaRisposta: RispostaSalvata = {
      domanda: domanda.domanda,
      risposte: domanda.risposte,
      testo_libero: freeText.trim(),
    };

    const nuoveRisposte = [...risposte, nuovaRisposta];
    setRisposte(nuoveRisposte);
    setShowFreeText(false);
    setFreeText("");

    if (currentIndex < domande.length - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 400);
    } else {
      saveSession(nuoveRisposte);
    }
  }, [currentIndex, domande, freeText, risposte]);

  const saveSession = async (risposteFinal: RispostaSalvata[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/specchio/sessione/salva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ capitoloId, domande: risposteFinal }),
      });
      const data = await res.json();
      onComplete(data.feedback || "", data.isUltimoGiorno || false);
    } catch {
      onComplete("Hai fatto un passo in più verso te stesso.", false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-2xl mb-3 ember-pulse" style={{ color: cap?.colore }}>
            {cap?.icona}
          </div>
          <p className="text-text-muted text-sm font-ui">Preparo le domande...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-text-muted font-body italic">{error}</p>
        </div>
      </div>
    );
  }

  if (saving) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-2xl mb-3 ember-pulse">&#x2726;</div>
          <p className="text-text-muted text-sm font-ui">Salvo le tue risposte...</p>
        </motion.div>
      </div>
    );
  }

  const domandaCorrente = domande[currentIndex];
  if (!domandaCorrente) return null;

  return (
    <div className="min-h-screen flex flex-col px-6 py-8">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {domande.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: i < currentIndex ? (cap?.colore || "#C9A84C") : i === currentIndex ? (cap?.colore || "#C9A84C") : "rgba(90,122,92,0.3)",
              transform: i === currentIndex ? "scale(1.3)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Chapter label */}
      <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] text-center mb-12">
        GIORNO {giorno} &middot; {cap?.titolo.toUpperCase()}
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm"
          >
            <h2 className="text-2xl font-display text-center leading-snug mb-10">
              {domandaCorrente.domanda}
            </h2>

            {!showFreeText ? (
              <div className="space-y-3">
                {domandaCorrente.risposte.map((risposta, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.08, duration: 0.2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(risposta)}
                    className="w-full text-left p-4 rounded-xl border border-text-muted/20 font-body text-[15px] text-text-primary leading-relaxed hover:border-amber/40 transition-colors"
                  >
                    {risposta}
                  </motion.button>
                ))}

                <button
                  onClick={() => setShowFreeText(true)}
                  className="w-full text-center text-[12px] text-text-muted font-ui mt-4 py-2"
                >
                  Rispondi a modo tuo &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value.slice(0, 200))}
                  placeholder="Scrivi la tua risposta..."
                  autoFocus
                  className="w-full h-28 p-4 rounded-xl bg-bg-surface border border-text-muted/20 font-body text-[15px] text-text-primary resize-none focus:border-amber/40 focus:outline-none transition-colors"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-text-muted font-ui">{freeText.length}/200</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowFreeText(false); setFreeText(""); }}
                      className="text-[12px] text-text-muted font-ui px-3 py-1.5"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={handleFreeTextSubmit}
                      disabled={!freeText.trim()}
                      className="text-[12px] text-amber font-ui px-3 py-1.5 disabled:opacity-30"
                    >
                      Conferma &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
