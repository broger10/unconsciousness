"use client";

import { motion } from "framer-motion";

const premium = [0.16, 1, 0.3, 1] as const;

export function SchermataRiposa({
  haRitratto,
  onVediRitratto,
}: {
  haRitratto: boolean;
  onVediRitratto?: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: premium }}
        className="text-center max-w-sm"
      >
        <div className="text-4xl mb-6">{"\u{1F319}"}</div>

        <h2 className="text-2xl font-bold font-display mb-4">
          Hai gi&agrave; fatto la tua parte oggi.
        </h2>

        <p className="text-text-secondary font-body italic text-lg leading-relaxed mb-8">
          Torna domani. Il cosmo non ha fretta.
        </p>

        {haRitratto && onVediRitratto && (
          <button
            onClick={onVediRitratto}
            className="text-[12px] text-amber font-ui tracking-wide"
          >
            Rileggi il tuo ultimo ritratto &rarr;
          </button>
        )}
      </motion.div>
    </div>
  );
}
