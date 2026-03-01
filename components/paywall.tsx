"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import { Sparkle, Diamond, Moon, Gem } from "lucide-react";

const premium = [0.16, 1, 0.3, 1] as const;

export function Paywall({ userName }: { userName?: string }) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = async (plan: "monthly" | "yearly") => {
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: premium }}
        className="w-full max-w-md mx-auto relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.1, stiffness: 150 }}
            className="mb-6 flex justify-center"
          >
            <Sparkle size={40} className="text-amber breathe" />
          </motion.div>
          <h1 className="text-2xl font-bold font-display mb-3">
            {userName ? `${userName}, entra` : "Entra"} nel Sanctum
          </h1>
          <p className="text-text-secondary font-body text-base italic">
            L&apos;astrologia che finalmente ti vede davvero.
          </p>
        </div>

        {/* Features — evocative, not technical */}
        <div className="glass rounded-2xl p-5 mb-6 border border-amber/10">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Sparkle size={14} className="text-amber shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-display font-bold">L&apos;oracolo che ti conosce</div>
                <div className="text-xs text-text-muted font-ui">Chat illimitata con un&apos;intelligenza che legge le tue stelle.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Diamond size={14} className="text-verdigris shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-display font-bold">La mappa delle tue ombre</div>
                <div className="text-xs text-text-muted font-ui">Esplora le parti di te che non hai ancora incontrato.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Moon size={14} className="text-sienna shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-display font-bold">Visioni che anticipano il tuo futuro</div>
                <div className="text-xs text-text-muted font-ui">Tre scenari cosmici per ogni decisione importante.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Gem size={14} className="text-amber-glow shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-display font-bold">Un diario che ti riflette</div>
                <div className="text-xs text-text-muted font-ui">Scrivi e l&apos;AI ti mostra i pattern nascosti.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-3 mb-6">
          {/* Yearly — best value */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, ease: premium }}
            onClick={() => handleUpgrade("yearly")}
            disabled={!!loadingPlan}
            className="w-full glass rounded-2xl p-5 dimensional border border-amber/20 hover:border-amber/40 transition-all text-left relative overflow-hidden cursor-pointer"
          >
            <div className="absolute top-3 right-3 bg-amber text-bg-base text-[10px] font-bold font-ui px-2 py-0.5 rounded-full">
              -40%
            </div>
            <div className="text-xs text-amber font-ui tracking-[0.15em] mb-1">ANNUALE</div>
            <div className="text-xl font-bold font-display mb-1">
              {loadingPlan === "yearly" ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
                  Caricamento...
                </span>
              ) : (
                <>&euro;49,99<span className="text-sm font-normal text-text-muted">/anno</span></>
              )}
            </div>
            <div className="text-xs text-text-muted font-ui">&euro;4,17/mese &mdash; accesso illimitato</div>
          </motion.button>

          {/* Monthly */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, ease: premium }}
            onClick={() => handleUpgrade("monthly")}
            disabled={!!loadingPlan}
            className="w-full glass rounded-2xl p-5 dimensional border border-border hover:border-border-light transition-all text-left cursor-pointer"
          >
            <div className="text-xs text-text-muted font-ui tracking-[0.15em] mb-1">MENSILE</div>
            <div className="text-xl font-bold font-display mb-1">
              {loadingPlan === "monthly" ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-text-muted/30 border-t-text-muted rounded-full animate-spin" />
                  Caricamento...
                </span>
              ) : (
                <>&euro;6,99<span className="text-sm font-normal text-text-muted">/mese</span></>
              )}
            </div>
            <div className="text-xs text-text-muted font-ui">Cancella quando vuoi</div>
          </motion.button>
        </div>

        {/* Social proof + reassurance */}
        <div className="text-center mb-6">
          <p className="text-xs text-text-muted font-ui mb-1">
            Gi&agrave; 100+ anime nel Sanctum
          </p>
          <p className="text-[10px] text-text-muted/60 font-ui">
            Cancella quando vuoi. Nessuna sorpresa.
          </p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-center text-xs text-text-muted/50 font-ui hover:text-text-muted transition-colors py-2 cursor-pointer"
        >
          Esci dall&apos;account
        </button>
      </motion.div>
    </div>
  );
}
