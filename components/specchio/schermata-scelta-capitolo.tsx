"use client";

import { motion } from "framer-motion";
import { CAPITOLI } from "@/lib/specchio-capitoli";

const premium = [0.16, 1, 0.3, 1] as const;

interface Consiglio {
  slug: string;
  motivazione: string;
}

export function SchermataSceltaCapitolo({
  consigli,
  loading,
  onSelect,
}: {
  consigli: Consiglio[];
  loading: boolean;
  onSelect: (slug: string) => void;
}) {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-2xl mb-3 ember-pulse">&#x25C8;</div>
          <p className="text-text-muted text-sm font-ui">Il cosmo sta scegliendo...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: premium }}
        className="w-full max-w-sm"
      >
        <div className="text-[10px] text-amber font-ui tracking-[0.3em] text-center mb-2">
          IL COSMO CONSIGLIA
        </div>
        <h2 className="text-2xl font-bold font-display text-center mb-8">
          Da dove vuoi cominciare?
        </h2>

        <div className="space-y-4">
          {consigli.map((consiglio, i) => {
            const cap = CAPITOLI[consiglio.slug];
            if (!cap) return null;

            return (
              <motion.button
                key={consiglio.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: premium }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(consiglio.slug)}
                className="w-full text-left glass rounded-2xl p-6 dimensional border border-border/30 hover:border-amber/20 transition-all"
              >
                <div className="text-3xl mb-3">{cap.icona}</div>
                <div className="text-xl font-bold font-display mb-1" style={{ color: cap.colore }}>
                  {cap.titolo}
                </div>
                <div className="text-sm text-text-primary font-body mb-2">
                  {cap.sottotitolo}
                </div>
                <div className="text-[13px] text-text-muted font-body italic">
                  {consiglio.motivazione}
                </div>
                <div className="mt-4 text-xs text-amber font-ui tracking-wide">
                  Inizia questo &rarr;
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
