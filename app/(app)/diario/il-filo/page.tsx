"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FiloAnalysis } from "@/lib/types/filo";
import { FiloSkeleton } from "@/components/filo/filo-skeleton";
import { FiloPatternCard } from "@/components/filo/filo-pattern-card";
import { decodeHtmlEntities } from "@/lib/utils";
import { Sparkle, Diamond, Sun, Moon, CircleAlert, ArrowLeft } from "lucide-react";

export default function IlFiloPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<FiloAnalysis | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 3000);

    fetch("/api/filo/analyze")
      .then((r) => r.json().then((d) => ({ ok: r.ok, status: r.status, data: d })))
      .then(({ ok, status, data }) => {
        if (!ok) {
          if (data.error === "too_few_entries") {
            setError("too_few");
          } else if (status === 402) {
            setError("no_credits");
          } else {
            setError("failed");
          }
        } else if (data.analysis) {
          setAnalysis(data.analysis);
          setIsPremium(data.isPremium ?? false);
        }
        setLoading(false);
        setShowToast(false);
      })
      .catch(() => {
        setError("failed");
        setLoading(false);
        setShowToast(false);
      });

    return () => clearTimeout(timer);
  }, []);

  const handleAskQuestion = (question: string) => {
    router.push(`/diario?prompt=${encodeURIComponent(question)}`);
  };

  return (
    <div className="min-h-screen relative">
      {/* Toast */}
      {showToast && loading && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 filo-toast-enter">
          <div className="glass rounded-full px-5 py-2.5 border border-amber/15 flex items-center gap-2">
            <Sparkle size={12} className="text-amber filo-pulse" />
            <span className="text-xs font-ui text-text-secondary">Il cosmo sta leggendo il tuo filo...</span>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/diario"
            className="text-text-muted text-xs font-ui transition-colors duration-200 hover:text-text-secondary flex items-center gap-1.5 mb-4"
          >
            <ArrowLeft size={12} /> Torna al diario
          </Link>
          <Sparkle size={36} className="text-amber mb-3 filo-pulse" />
          <h1 className="text-2xl font-bold font-display mb-1">Il Filo</h1>
          <p className="text-text-muted text-sm font-body italic">
            Il filo nascosto che lega le tue riflessioni
          </p>
        </div>

        {/* Loading */}
        {loading && <FiloSkeleton />}

        {/* Error: too few entries */}
        {error === "too_few" && (
          <div className="glass rounded-2xl p-6 border border-amber/10 text-center">
            <Moon size={30} className="text-text-muted mb-4 mx-auto" />
            <p className="text-text-secondary font-body italic mb-2">
              Il cielo ha bisogno di pi&ugrave; parole per trovare il tuo filo.
            </p>
            <p className="text-xs text-text-muted font-ui mb-5">
              Scrivi almeno 3 riflessioni nel tuo diario cosmico.
            </p>
            <Link
              href="/diario"
              className="inline-block px-5 py-2.5 rounded-xl bg-amber text-bg-base text-sm font-ui transition-colors duration-200 hover:bg-amber-glow"
            >
              Apri il diario
            </Link>
          </div>
        )}

        {/* Error: no credits */}
        {error === "no_credits" && (
          <div className="glass rounded-2xl p-6 border border-sienna/20 text-center">
            <CircleAlert size={30} className="text-sienna mb-4 mx-auto" />
            <p className="text-sm text-sienna font-ui">
              Crediti esauriti. Passa a Premium dal tuo profilo.
            </p>
          </div>
        )}

        {/* Error: analysis failed */}
        {error === "failed" && (
          <div className="glass rounded-2xl p-6 border border-sienna/20 text-center">
            <CircleAlert size={30} className="text-text-muted mb-4 mx-auto" />
            <p className="text-text-secondary font-body italic">
              Le stelle stanno ancora leggendo il tuo filo. Riprova tra poco.
            </p>
          </div>
        )}

        {/* Analysis result */}
        {analysis && (
          <div className="space-y-5 filo-fade-in">
            {/* Sintesi */}
            <div className="glass rounded-2xl p-6 border border-amber/10">
              <div className="flex items-center gap-1.5 text-[10px] text-amber font-ui tracking-[0.2em] mb-3">
                <Sparkle size={10} /> IL CIELO HA TROVATO
              </div>
              <p className="text-text-secondary font-body italic leading-relaxed text-lg">
                {decodeHtmlEntities(analysis.sintesi)}
              </p>
            </div>

            {/* Patterns */}
            {analysis.pattern.length > 0 && (
              <div>
                <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-3 px-1">
                  PATTERN RICORRENTI ({analysis.pattern.length})
                </div>
                <div className="space-y-3">
                  {analysis.pattern.map((pattern, index) => (
                    <FiloPatternCard
                      key={pattern.id}
                      pattern={pattern}
                      onAskQuestion={handleAskQuestion}
                      locked={!isPremium && index > 0}
                    />
                  ))}
                </div>

                {/* Paywall for free users */}
                {!isPremium && analysis.pattern.length > 1 && (
                  <div className="mt-4 glass rounded-xl p-5 border border-amber/15 text-center">
                    <Sparkle size={20} className="text-amber mb-2 mx-auto" />
                    <p className="text-sm font-display font-bold mb-1">
                      Il cielo ha trovato {analysis.pattern.length - 1} {analysis.pattern.length - 1 === 1 ? "altro pattern" : "altri pattern"}
                    </p>
                    <p className="text-xs text-text-muted font-body italic mb-4">
                      Entra nel Sanctum per vedere tutti i tuoi fili nascosti.
                    </p>
                    <Link
                      href="/profilo"
                      className="inline-block px-5 py-2.5 rounded-xl bg-amber text-bg-base text-sm font-ui font-bold transition-colors duration-200 hover:bg-amber-glow"
                    >
                      Entra nel Sanctum
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Filo Cosmico */}
            {analysis.filoCosmico && (
              <div className="glass rounded-2xl p-6 border border-verdigris/10">
                <div className="flex items-center gap-1.5 text-[10px] text-verdigris font-ui tracking-[0.2em] mb-3">
                  <Diamond size={10} /> IL FILO COSMICO
                </div>
                <p className="text-text-secondary font-body italic leading-relaxed">
                  {decodeHtmlEntities(analysis.filoCosmico)}
                </p>
              </div>
            )}

            {/* Prossimo Ciclo — only for premium */}
            {isPremium && analysis.prossimoCiclo && (
              <div className="glass rounded-2xl p-6 border border-amber/10">
                <div className="flex items-center gap-1.5 text-[10px] text-amber font-ui tracking-[0.2em] mb-3">
                  <Sun size={10} /> PROSSIMO CICLO
                </div>
                <p className="text-text-secondary font-body italic leading-relaxed">
                  {decodeHtmlEntities(analysis.prossimoCiclo)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
