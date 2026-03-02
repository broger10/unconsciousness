"use client";

import { motion } from "framer-motion";

const premium = [0.16, 1, 0.3, 1] as const;

export function SchermataInizio({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: premium }}
        className="text-center max-w-sm"
      >
        <div className="text-[11px] text-amber font-ui tracking-[0.3em] mb-6">
          &#x25C8; LO SPECCHIO
        </div>

        <h1 className="text-3xl font-bold font-display mb-4 leading-tight">
          Inizia a conoscerti davvero.
        </h1>

        <p className="text-text-secondary font-body italic text-lg leading-relaxed mb-10">
          7 percorsi. Qualche settimana.<br />
          Nessuna risposta giusta. Solo la tua verit&agrave;.
        </p>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className="px-8 py-3.5 rounded-xl bg-amber text-bg-base font-ui text-sm tracking-wide dimensional hover:glow transition-all"
        >
          Scegli il tuo primo capitolo &rarr;
        </motion.button>
      </motion.div>
    </div>
  );
}
