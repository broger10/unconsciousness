"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarkdownText } from "@/components/markdown-text";

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
  const shareCardRef = useRef<HTMLDivElement>(null);

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

  const shareResult = async () => {
    if (!result) return;

    const shareText = `${result.highlightQuote || "Scopri la danza tra due anime"}\n\nScopri la tua compatibilità cosmica → unconsciousness.vercel.app`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Compatibilità Cosmica",
          text: shareText,
        });
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const downloadShareImage = () => {
    if (!shareCardRef.current || !result) return;
    // Create a canvas from the share card
    const card = shareCardRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 600;
    canvas.height = 400;

    // Draw dark background
    ctx.fillStyle = "#0D1710";
    ctx.fillRect(0, 0, 600, 400);

    // Draw border
    ctx.strokeStyle = "rgba(201, 169, 110, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, 560, 360);

    // Title
    ctx.fillStyle = "#C9A96E";
    ctx.font = "bold 16px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Compatibilità Cosmica", 300, 60);

    // Signs
    ctx.font = "bold 24px Georgia, serif";
    ctx.fillStyle = "#EDE8DC";
    ctx.fillText(`☉ ${result.person1Sun}  ✦  ☉ ${result.person2Sun}`, 300, 110);

    // Quote
    ctx.font = "italic 16px Georgia, serif";
    ctx.fillStyle = "#B8AF9B";
    const quote = result.highlightQuote || "";
    const words = quote.split(" ");
    let line = "";
    let y = 170;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 480) {
        ctx.fillText(line.trim(), 300, y);
        line = word + " ";
        y += 28;
      } else {
        line = test;
      }
    }
    if (line.trim()) ctx.fillText(line.trim(), 300, y);

    // Footer
    ctx.fillStyle = "#6E6A60";
    ctx.font = "12px system-ui, sans-serif";
    ctx.fillText("unconsciousness — il tuo specchio cosmico", 300, 350);
    ctx.fillText("unconsciousness.vercel.app", 300, 370);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compatibilita-cosmica.png";
      a.click();
      URL.revokeObjectURL(url);
    });
  };

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
          <div className="text-4xl text-amber mb-3 breathe">&#10038;</div>
          <h1 className="text-2xl font-bold font-display mb-1">Compatibilità Cosmica</h1>
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
              "Rivela la connessione ✦"
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
              <div className="text-[10px] text-amber font-ui tracking-[0.2em] mb-4">
                ✦ COMPATIBILITÀ COSMICA
              </div>

              {/* Signs */}
              <div className="flex items-center justify-center gap-4 mb-5">
                <div className="text-center">
                  <div className="text-2xl text-amber mb-1">☉</div>
                  <div className="text-sm font-bold font-display">{result.person1Sun}</div>
                  <div className="text-[10px] text-text-muted font-ui">Tu</div>
                </div>
                <div className="text-amber text-lg">✦</div>
                <div className="text-center">
                  <div className="text-2xl text-verdigris mb-1">☉</div>
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
                    &ldquo;{result.highlightQuote}&rdquo;
                  </p>
                </div>
              )}

              {/* Share buttons */}
              <div className="flex gap-3">
                <button
                  onClick={shareResult}
                  className="flex-1 py-2.5 rounded-xl text-sm font-ui bg-amber text-bg-base dimensional hover:glow transition-all"
                >
                  Condividi ✦
                </button>
                <button
                  onClick={downloadShareImage}
                  className="flex-1 py-2.5 rounded-xl text-sm font-ui glass border border-amber/15 text-amber hover:glow transition-all"
                >
                  Scarica immagine
                </button>
              </div>

              {/* Hidden share card for canvas generation */}
              <div ref={shareCardRef} className="hidden" />
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
              className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-3 px-1 hover:text-amber transition-colors"
            >
              ULTIME COMPATIBILITÀ ({history.length}) {showHistory ? "▲" : "▼"}
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
                          <span className="text-amber text-xs font-ui">
                            ☉ {(item.person2ChartData as { sunSign?: string } | null)?.sunSign || "?"}
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
                          &ldquo;{item.highlightQuote}&rdquo;
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
