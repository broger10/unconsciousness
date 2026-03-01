"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LazyMarkdownText as MarkdownText } from "@/components/lazy-markdown";
import { decodeHtmlEntities } from "@/lib/utils";
import { CompatShareCard } from "@/components/share-card";
import { shareCardAsImage } from "@/lib/share";
import { Sparkle, Sun, Share, ChevronUp, ChevronDown } from "lucide-react";

const premium = [0.16, 1, 0.3, 1] as const;

interface CompatResult {
  id: string;
  analysis: string;
  highlightQuote: string;
  person1Sun: string;
  person2Sun: string;
  person2Chart: { sunSign: string; moonSign: string; risingSign: string };
}

interface HistoryItem {
  id: string;
  person2Name: string | null;
  person2ChartData: { sunSign?: string } | null;
  analysis: string;
  highlightQuote: string | null;
  createdAt: string;
}

export default function CompatibilitaPage() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [noTime, setNoTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompatResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/compatibility")
      .then((r) => r.json())
      .then((d) => {
        if (d.compatibilities) setHistory(d.compatibilities);
      })
      .catch(() => {});
  }, []);

  const analyze = async () => {
    if (!birthDate || loading) return;
    setLoading(true);
    setResult(null);
    setError("");

    try {
      const res = await fetch("/api/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          birthDate,
          birthTime: noTime ? undefined : birthTime || undefined,
          birthCity: birthCity || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Errore nella lettura delle stelle. Riprova.");
        return;
      }
      if (data.analysis) {
        setResult(data);
        // Add to history
        setHistory((prev) => [
          {
            id: data.id,
            person2Name: name || null,
            person2ChartData: data.person2Chart ? { sunSign: data.person2Chart.sunSign } : null,
            analysis: data.analysis,
            highlightQuote: data.highlightQuote,
            createdAt: new Date().toISOString(),
          },
          ...prev.slice(0, 2),
        ]);
        setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 300);
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const [userName, setUserName] = useState("");
  const [sharing, setSharing] = useState(false);
  const compatCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => { if (d.user?.name) setUserName(d.user.name.split(" ")[0]); })
      .catch(() => {});
  }, []);

  const handleShareCard = useCallback(async () => {
    if (!compatCardRef.current || sharing || !result) return;
    setSharing(true);
    try {
      await shareCardAsImage(compatCardRef.current, "compatibilita-cosmica.png");
    } catch {
      // cancelled or failed
    } finally {
      setSharing(false);
    }
  }, [sharing, result]);

  return (
    <div className="min-h-screen relative">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: premium }}
          className="text-center mb-6"
        >
          <Sparkle size={36} className="text-amber mb-3 breathe mx-auto" />
          <h1 className="text-2xl font-bold font-display mb-1">Compatibilit&agrave; Cosmica</h1>
          <p className="text-text-muted text-sm font-body italic">Scopri la danza tra due anime</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: premium }}
          className="glass rounded-2xl p-5 mb-5 dimensional"
        >
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-text-muted font-ui tracking-[0.2em] block mb-1.5">
                NOME (OPZIONALE)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Il nome dell'altra persona"
                className="w-full bg-bg-surface rounded-xl px-4 py-3 text-sm text-text-primary font-body placeholder:text-text-muted border border-border/50 focus:border-amber/30 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-ui tracking-[0.2em] block mb-1.5">
                DATA DI NASCITA *
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-bg-surface rounded-xl px-4 py-3 text-sm text-text-primary font-ui border border-border/50 focus:border-amber/30 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] text-text-muted font-ui tracking-[0.2em]">
                  ORA DI NASCITA
                </label>
                <button
                  onClick={() => setNoTime(!noTime)}
                  className={`text-[10px] font-ui px-2 py-1 rounded-full transition-all ${
                    noTime
                      ? "glass text-amber border border-amber/15"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  Non so l&apos;ora
                </button>
              </div>
              {!noTime && (
                <input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full bg-bg-surface rounded-xl px-4 py-3 text-sm text-text-primary font-ui border border-border/50 focus:border-amber/30 focus:outline-none transition-colors"
                />
              )}
            </div>

            <div>
              <label className="text-[10px] text-text-muted font-ui tracking-[0.2em] block mb-1.5">
                LUOGO DI NASCITA
              </label>
              <input
                type="text"
                value={birthCity}
                onChange={(e) => setBirthCity(e.target.value)}
                placeholder="es. Roma, Milano, Napoli..."
                className="w-full bg-bg-surface rounded-xl px-4 py-3 text-sm text-text-primary font-body placeholder:text-text-muted border border-border/50 focus:border-amber/30 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            onClick={analyze}
            disabled={!birthDate || loading}
            className={`w-full mt-5 py-3.5 rounded-xl text-sm font-ui transition-all duration-300 ${
              birthDate && !loading
                ? "bg-amber text-bg-base dimensional hover:glow breathe"
                : "bg-bg-surface text-text-muted border border-border/50"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-bg-base rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-bg-base rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-bg-base rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="ml-2">Le stelle si confrontano...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Rivela la connessione <Sparkle size={14} />
              </span>
            )}
          </button>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-2xl p-4 mb-5 border border-sienna/20"
          >
            <p className="text-sm text-sienna font-body text-center">{error}</p>
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && (
            <motion.div
              ref={resultRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ease: premium }}
              className="glass rounded-2xl p-6 mb-5 dimensional glow border border-amber/10"
            >
              <div className="flex items-center gap-1.5 text-[10px] text-amber font-ui tracking-[0.2em] mb-4">
                <Sparkle size={10} /> COMPATIBILIT&Agrave; COSMICA
              </div>

              {/* Signs */}
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="text-center">
                  <Sun size={24} className="text-amber mb-1 mx-auto" />
                  <div className="text-sm font-bold font-display">{result.person1Sun}</div>
                  <div className="text-[10px] text-text-muted font-ui">Tu</div>
                </div>
                <Sparkle size={18} className="text-amber" />
                <div className="text-center">
                  <Sun size={24} className="text-verdigris mb-1 mx-auto" />
                  <div className="text-sm font-bold font-display">{result.person2Sun}</div>
                  <div className="text-[10px] text-text-muted font-ui">{name || "L'altra persona"}</div>
                </div>
              </div>

              {/* Analysis */}
              <MarkdownText
                content={result.analysis}
                className="text-text-secondary font-body italic leading-relaxed text-lg mb-5"
              />

              {/* Highlight Quote */}
              {result.highlightQuote && (
                <div className="glass rounded-xl p-4 mb-5 border border-amber/10">
                  <p className="text-amber font-body italic text-center text-sm leading-relaxed">
                    &ldquo;{decodeHtmlEntities(result.highlightQuote)}&rdquo;
                  </p>
                </div>
              )}

              {/* Share button */}
              <button
                onClick={handleShareCard}
                disabled={sharing}
                className="w-full py-3 rounded-xl text-sm font-ui flex items-center justify-center gap-2 border border-amber/20 text-amber/80 hover:border-amber/40 hover:text-amber transition-all disabled:opacity-40"
              >
                {sharing ? (
                  <span className="w-3.5 h-3.5 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
                ) : (
                  <Share size={14} />
                )}
                Condividi nelle stories
              </button>

              {/* Hidden share card for image generation */}
              <div style={{ position: "absolute", left: -9999, top: 0 }}>
                <CompatShareCard
                  ref={compatCardRef}
                  person1Name={userName || "Tu"}
                  person1Sun={result.person1Sun}
                  person2Name={name || "?"}
                  person2Sun={result.person2Sun}
                  highlightQuote={decodeHtmlEntities(result.highlightQuote || "")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-1 text-[10px] text-text-muted font-ui tracking-[0.2em] mb-3 px-1 hover:text-amber transition-colors"
            >
              ULTIME COMPATIBILIT&Agrave; ({history.length}) {showHistory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ ease: premium }}
                  className="overflow-hidden space-y-3"
                >
                  {history.map((item) => (
                    <div key={item.id} className="glass rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold font-display">
                          {item.person2Name || "Persona"}{" "}
                          <span className="inline-flex items-center gap-1 text-amber text-xs font-ui">
                            <Sun size={10} /> {(item.person2ChartData as { sunSign?: string } | null)?.sunSign || "?"}
                          </span>
                        </span>
                        <span className="text-[10px] text-text-muted font-ui">
                          {new Date(item.createdAt).toLocaleDateString("it-IT", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      {item.highlightQuote && (
                        <p className="text-xs text-text-secondary font-body italic">
                          &ldquo;{decodeHtmlEntities(item.highlightQuote)}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
