import Link from "next/link";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            <span className="text-gradient">un</span>
            <span className="text-text-primary">consciousness</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            >
              Accedi
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent-secondary transition-all shadow-lg shadow-accent-glow/20"
            >
              Inizia gratis
            </Link>
          </div>
        </div>
      </nav>
      {children}
      <footer className="border-t border-border py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            &copy; 2026 Unconsciousness. Vedi te stesso con chiarezza.
          </p>
          <div className="flex gap-6 text-sm text-text-muted">
            <Link href="#" className="hover:text-text-secondary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-text-secondary transition-colors">
              Termini
            </Link>
            <Link href="#" className="hover:text-text-secondary transition-colors">
              Contatti
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
