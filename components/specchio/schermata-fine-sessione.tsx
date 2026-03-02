"use client";

import { motion } from "framer-motion";

const premium = [0.16, 1, 0.3, 1] as const;

export function SchermataFineSessione({
  feedback,
  isUltimoGiorno,
  onContinua,
}: {
  feedback: string;
  isUltimoGiorno: boolean;
  onContinua: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: premium }}
        className="text-center max-w-sm"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-4xl text-amber mb-6"
        >
          &#x2726;
        </motion.div>

        <h2 className="text-2xl font-bold font-display mb-4">
          Sessione completata.
        </h2>

        <p className="text-text-secondary font-body italic text-lg leading-relaxed mb-8">
          {feedback}
        </p>

        {isUltimoGiorno ? (
          <>
            <p className="text-amber font-body text-sm mb-6">
              Hai completato questo capitolo.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onContinua}
              className="px-8 py-3.5 rounded-xl bg-amber text-bg-base font-ui text-sm tracking-wide dimensional hover:glow transition-all"
            >
              Scopri il tuo ritratto &rarr;
            </motion.button>
          </>
        ) : (
          <p className="text-text-muted font-body text-sm italic">
            Torna domani per continuare.
          </p>
        )}
      </motion.div>
    </div>
  );
}
