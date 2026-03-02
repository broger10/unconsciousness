"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CAPITOLI } from "@/lib/specchio-capitoli";

const premium = [0.16, 1, 0.3, 1] as const;

export function SchermataRitratto({
  capitoloId,
  capitoloSlug,
  ritratto: initialRitratto,
  insights: initialInsights,
  onContinua,
}: {
  capitoloId: string;
  capitoloSlug: string;
  ritratto?: string | null;
  insights?: string[];
  onContinua: () => void;
}) {
  const [ritratto, setRitratto] = useState(initialRitratto || "");
  const [insights, setInsights] = useState<string[]>(initialInsights || []);
  const [loading, setLoading] = useState(!initialRitratto);

  const cap = CAPITOLI[capitoloSlug];

  useEffect(() => {
    if (initialRitratto) return;

    fetch("/api/specchio/ritratto/genera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ capitoloId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.ritratto) setRitratto(d.ritratto);
        if (d.insights) setInsights(d.insights);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [capitoloId, initialRitratto]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-2xl mb-3 ember-pulse" style={{ color: cap?.colore }}>
            {cap?.icona}
          </div>
          <p className="text-text-muted text-sm font-ui">Scrivo il tuo ritratto...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: premium }}
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-[10px] font-ui tracking-[0.3em] mb-2" style={{ color: cap?.colore }}>
            IL TUO RITRATTO &middot; {cap?.titolo.toUpperCase()}
          </div>
          <div className="w-12 h-px mx-auto" style={{ backgroundColor: cap?.colore || "#C9A84C" }} />
        </div>

        {/* Portrait text */}
        <div className="mb-8">
          {ritratto.split("\n\n").map((paragrafo, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.2, duration: 0.6, ease: premium }}
              className="text-text-primary font-body text-[17px] italic leading-relaxed mb-4"
            >
              {paragrafo}
            </motion.p>
          ))}
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <div className="w-full h-px bg-border/30 mb-6" />
            <div className="text-[10px] font-ui tracking-[0.2em] text-text-muted mb-4">
              COSA QUESTO RIVELA
            </div>
            <div className="space-y-3">
              {insights.map((insight, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + i * 0.15, duration: 0.4, ease: premium }}
                  className="text-text-secondary font-body text-[15px] leading-relaxed"
                >
                  {insight}
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="text-center mt-10 pb-20"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onContinua}
            className="px-8 py-3.5 rounded-xl bg-amber text-bg-base font-ui text-sm tracking-wide dimensional hover:glow transition-all"
          >
            Continua il percorso &rarr;
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}
