"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { UnLogo } from "@/components/un-logo";
import { Diamond, ArrowLeft } from "lucide-react";

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
            <ArrowLeft size={12} /> Torna alla home
          </Link>
        </div>

        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 1, ease: premium }}
            className="mb-6 flex justify-center"
          >
            <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="drop-shadow-[0_0_30px_rgba(201,168,76,0.12)]">
              <defs>
                <radialGradient id="lg">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* Ambient glow */}
              <circle cx="70" cy="70" r="65" fill="url(#lg)" />
              {/* Orbital planes */}
              <ellipse cx="70" cy="70" rx="55" ry="20" stroke="#4A9B8E" strokeWidth="0.5" opacity="0.3" transform="rotate(-30 70 70)" />
              <ellipse cx="70" cy="70" rx="40" ry="28" stroke="#C9A84C" strokeWidth="0.6" opacity="0.35" transform="rotate(20 70 70)" />
              <ellipse cx="70" cy="70" rx="25" ry="16" stroke="#C4614A" strokeWidth="0.7" opacity="0.3" transform="rotate(-15 70 70)" />
              {/* Planets */}
              <circle cx="25" cy="55" r="3" fill="#4A9B8E" opacity="0.75" />
              <circle cx="105" cy="55" r="2.5" fill="#C9A84C" opacity="0.8" />
              <circle cx="52" cy="78" r="2" fill="#C4614A" opacity="0.65" />
              {/* Central sun */}
              <circle cx="70" cy="70" r="6" fill="#C9A84C" opacity="0.85" />
              <circle cx="70" cy="70" r="3" fill="#F0E6C8" />
              {/* Distant stars */}
              <circle cx="15" cy="25" r="1" fill="#C9A84C" opacity="0.2" />
              <circle cx="130" cy="30" r="1.2" fill="#4A9B8E" opacity="0.15" />
              <circle cx="20" cy="115" r="0.8" fill="#C9A84C" opacity="0.15" />
              <circle cx="125" cy="110" r="1" fill="#4A9B8E" opacity="0.1" />
            </svg>
          </motion.div>
          <h1 className="mb-2">
            <UnLogo size="lg" />
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
              <Diamond size={10} className="text-verdigris" />
              <span>I tuoi dati restano solo tuoi. Sempre.</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-ui">
              <Diamond size={10} className="text-amber" />
              <span>Zero tracking, zero pubblicit&agrave;.</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-text-muted font-ui">
              <Diamond size={10} className="text-sienna" />
              <span>20 crediti gratis alla registrazione.</span>
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
