"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";

const premium = [0.16, 1, 0.3, 1] as const;

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="fixed inset-0 alchemy-bg pointer-events-none opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: premium }}
        className="w-full max-w-sm mx-auto relative z-10"
      >
        {/* Back to home */}
        <div className="mb-8">
          <Link href="/" className="text-text-muted text-xs font-ui hover:text-text-secondary transition-colors flex items-center gap-1.5">
            <span>&#8592;</span> Torna alla home
          </Link>
        </div>

        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
            className="text-5xl mb-6 text-amber breathe"
          >
            &#9670;
          </motion.div>
          <h1 className="text-2xl font-bold font-display mb-2">
            <span className="text-gradient">unconsciousness</span>
          </h1>
          <p className="text-text-secondary font-body text-base italic">
            Il tuo cielo ti aspetta
          </p>
        </div>

        <div className="glass rounded-2xl p-8 dimensional border border-amber/5">
          <button
            onClick={() => signIn("google", { callbackUrl: "/oggi" })}
            className="w-full py-4 rounded-xl bg-text-primary text-bg-base text-sm font-bold font-ui flex items-center justify-center gap-3 hover:bg-amber transition-colors duration-300 dimensional"
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continua con Google
          </button>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-ui">
              <span className="text-verdigris">&#9670;</span>
              <span>I tuoi dati restano solo tuoi. Sempre.</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-ui">
              <span className="text-amber">&#9670;</span>
              <span>Zero tracking, zero pubblicit&agrave;.</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-ui">
              <span className="text-sienna">&#9670;</span>
              <span>Gratuito durante la beta.</span>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-text-muted/50 font-ui mt-6">
          Continuando accetti i nostri Termini di Servizio e la Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
