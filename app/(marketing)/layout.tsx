"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">✦</span>
            <span className="text-xl font-bold text-gradient-cosmic">unconsciousness</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
            >
              Accedi
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-lg">✦</span>
            <span className="font-medium text-gradient-cosmic">unconsciousness</span>
          </div>
          <p className="text-text-muted text-sm text-center">
            I tuoi dati cosmici non vengono mai condivisi. Mai.
          </p>
          <p className="text-text-muted text-sm">
            &copy; {new Date().getFullYear()} unconsciousness
          </p>
        </div>
      </footer>
    </div>
  );
}
