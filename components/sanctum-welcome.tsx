"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle } from "lucide-react";

const premium = [0.16, 1, 0.3, 1] as const;

export function SanctumWelcome() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      searchParams.get("upgraded") === "true" &&
      !localStorage.getItem("sanctumWelcomeShown")
    ) {
      setShow(true);
      localStorage.setItem("sanctumWelcomeShown", "1");
    }
  }, [searchParams]);

  const dismiss = () => {
    setShow(false);
    router.replace("/profilo");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-bg-base/95 backdrop-blur-sm"
        >
          {/* Stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute w-0.5 h-0.5 bg-amber/50 rounded-full"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, ease: premium }}
            className="text-center relative z-10 px-6 max-w-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", delay: 0.4, stiffness: 150 }}
              className="mb-8 flex justify-center"
            >
              <Sparkle size={48} className="text-amber" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, ease: premium }}
              className="text-2xl font-bold font-display mb-3"
            >
              Sei entrat&#42; nel Sanctum
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-text-secondary font-body italic text-base mb-10"
            >
              Le stelle ti aspettavano.
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              onClick={dismiss}
              className="px-8 py-3.5 rounded-xl bg-amber text-bg-base text-sm font-bold font-ui dimensional hover:glow transition-all"
            >
              Inizia il viaggio
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
