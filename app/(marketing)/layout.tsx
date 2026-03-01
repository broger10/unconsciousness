"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Navbar — minimal, sticky, glass */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-amber text-lg">&#9670;</span>
            <span className="text-base font-bold font-display"><span className="text-amber">un</span><span className="text-gradient">consciousness</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="#come-funziona"
              className="hidden sm:inline text-xs text-text-muted font-ui hover:text-text-secondary transition-colors"
            >
              Come funziona
            </a>
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl bg-amber text-bg-base text-xs font-bold font-ui hover:bg-amber-glow transition-colors dimensional"
            >
              Inizia gratis
            </Link>
          </div>
        </div>
      </motion.nav>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <span className="text-amber">&#9670;</span>
              <span className="font-display text-sm"><span className="text-amber">un</span><span className="text-gradient">consciousness</span></span>
            </div>
            <div className="flex items-center gap-6 text-xs text-text-muted font-ui">
              <a href="mailto:andrea.brognera@icloud.com" className="hover:text-text-secondary transition-colors">Contatti</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-border/30">
            <p className="text-text-muted/60 text-[10px] font-ui">
              I tuoi dati cosmici non vengono mai condivisi, venduti o utilizzati per addestrare modelli AI. Mai.
            </p>
            <p className="text-text-muted/60 text-[10px] font-ui">
              &copy; {new Date().getFullYear()} <span className="text-amber">un</span>consciousness. Tutti i diritti riservati.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
