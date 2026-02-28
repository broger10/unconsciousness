"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-amber text-xl">&#9670;</span>
            <span className="text-lg font-bold font-display text-gradient">unconsciousness</span>
          </Link>
          <Link
            href="/login"
            className="px-5 py-2 rounded-xl bg-amber/10 text-amber text-sm font-medium font-ui hover:bg-amber/20 transition-colors"
          >
            Accedi
          </Link>
        </div>
      </motion.nav>
      <main>{children}</main>
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-amber">&#9670;</span>
            <span className="font-display text-gradient">unconsciousness</span>
          </div>
          <p className="text-text-muted text-sm font-ui text-center">
            I tuoi dati cosmici non vengono mai condivisi. Mai.
          </p>
          <p className="text-text-muted text-sm font-ui">
            &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
