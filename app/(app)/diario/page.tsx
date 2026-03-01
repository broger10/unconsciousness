"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LazyMarkdownText as MarkdownText } from "@/components/lazy-markdown";

const premium = [0.16, 1, 0.3, 1] as const;

interface JournalEntry {
  id: string;
  content: string;
  aiReflection: string | null;
  createdAt: string;
}

interface CheckinEntry {
  id: string;
  mood: number;
  energy: number;
  aiInsight: string | null;
  createdAt: string;
}

type Filter = "tutto" | "diario" | "mood";

const moodLabels: Record<number, string> = {
  1: "Pesante",
  2: "Bassa",
  3: "Neutra",
  4: "Buona",
  5: "Radiante",
};

const moodSymbols: Record<number, string> = {
  1: "&#9676;",
  2: "&#9681;",
  3: "&#9672;",
  4: "&#9670;",
  5: "&#10038;",
};

const dailyPhrases = [
  "Cosa attraversa la tua mente oggi?",
  "Quale ombra hai incontrato questa settimana?",
  "Scrivi ciò che non riesci a dire ad alta voce",
  "Qual è la verità che stai evitando?",
  "Cosa hai scoperto di te oggi?",
  "Descrivi un momento che ti ha sorpreso",
  "Quale pattern si sta ripetendo?",
  "Cosa ti sta chiedendo il silenzio?",
  "Dove senti resistenza nella tua vita?",
  "Quale parte di te chiede attenzione?",
  "Scrivi una lettera al te stesso di un anno fa",
  "Cosa significherebbe lasciar andare?",
  "Quale domanda continua a tornare?",
  "Cosa ti ha insegnato la Luna questa settimana?",
  "Descrivi una paura che porti con te",
  "Quale dono non stai usando?",
  "Cosa cambieresti se nessuno giudicasse?",
  "Scrivi il sogno più vivido che ricordi",
  "Quale relazione ti sta trasformando?",
  "Dove cerchi approvazione?",
  "Cosa significa casa per te oggi?",
  "Quale confine hai bisogno di tracciare?",
  "Scrivi senza pensare per due minuti",
  "Cosa ti rende vivo/a in questo momento?",
  "Quale eredità stai portando avanti?",
  "Descrivi il tuo rapporto con il tempo",
  "Cosa stai costruendo nel silenzio?",
  "Quale versione di te sta emergendo?",
  "Scrivi la cosa più vera che sai",
  "Cosa ti direbbe il cielo se potesse parlare?",
];

function getDailyPhrase(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return dailyPhrases[dayOfYear % dailyPhrases.length];
}

export default function DiarioPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [checkins, setCheckins] = useState<CheckinEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("tutto");
  const [expandedReflection, setExpandedReflection] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/journal").then((r) => r.json()),
      fetch("/api/checkin").then((r) => r.json()).catch(() => ({ checkins: [], streak: 0 })),
    ])
      .then(([journalData, checkinData]) => {
        if (journalData.journals) setJournals(journalData.journals);
        if (checkinData.checkins) setCheckins(checkinData.checkins);
        if (checkinData.streak) setStreak(checkinData.streak);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const [error, setError] = useState("");

  const saveEntry = async () => {
    if (!newEntry.trim() || saving) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newEntry }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(res.status === 402
          ? "Crediti esauriti. Passa a Premium dal tuo profilo."
          : data.error || "Errore nel salvataggio.");
        return;
      }
      if (data.journal) {
        setJournals((prev) => [data.journal, ...prev]);
        setNewEntry("");
        setExpandedReflection(data.journal.id);
      }
    } catch {
      setError("Errore di connessione. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  // Merge and sort timeline
  const timeline: Array<{ type: "journal" | "checkin"; date: string; data: JournalEntry | CheckinEntry }> = [];

  if (filter !== "mood") {
    journals.forEach((j) => timeline.push({ type: "journal", date: j.createdAt, data: j }));
  }
  if (filter !== "diario") {
    checkins.forEach((c) => timeline.push({ type: "checkin", date: c.createdAt, data: c }));
  }

  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group by date
  const grouped: Record<string, typeof timeline> = {};
  timeline.forEach((item) => {
    const dateKey = new Date(item.date).toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(item);
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-4xl text-amber ember-pulse mb-4">&#9790;</div>
          <p className="text-text-muted text-sm font-ui">Apro il diario...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: premium }}
          className="mb-5"
        >
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold font-display">Diario Cosmico</h1>
            {streak > 0 && (
              <span className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
                <span className="text-amber text-xs ember-pulse">&#9670;</span>
                <span className="text-amber text-xs font-bold font-ui">{streak} {streak === 1 ? "giorno" : "giorni"}</span>
              </span>
            )}
          </div>
          <p className="text-text-muted text-xs font-ui">Scrivi, rifletti, scopri i tuoi pattern nascosti.</p>
        </motion.div>

        {/* New entry card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, ease: premium }}
          className="glass rounded-2xl p-5 mb-5 dimensional border border-amber/5"
        >
          <div className="text-[10px] text-amber font-ui tracking-[0.2em] mb-3">&#9790; SCRIVI</div>
          <textarea
            value={newEntry}
            onChange={(e) => setNewEntry(e.target.value)}
            placeholder={getDailyPhrase()}
            rows={4}
            className="w-full bg-transparent text-text-primary font-body text-lg italic placeholder:text-text-muted/60 resize-none focus:outline-none leading-relaxed mb-3"
          />
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-ui ${newEntry.length > 10000 ? "text-sienna" : "text-text-muted"}`}>
              {newEntry.length > 0 ? `${newEntry.length}/10000` : ""}
            </span>
            <button
              onClick={saveEntry}
              disabled={!newEntry.trim() || saving}
              className={`px-5 py-2 rounded-xl text-sm font-ui transition-all duration-300 ${
                newEntry.trim() && !saving
                  ? "bg-amber text-bg-base dimensional hover:glow"
                  : "bg-bg-surface text-text-muted border border-border/50"
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-1 h-1 bg-bg-base rounded-full animate-bounce" />
                  Rivelo...
                </span>
              ) : (
                "◆ Rivela"
              )}
            </button>
          </div>
          {error && (
            <div className="mt-3 text-xs text-sienna font-ui bg-sienna/10 rounded-lg px-3 py-2">
              {error}
            </div>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 mb-5"
        >
          {(["tutto", "diario", "mood"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-ui tracking-wide transition-all duration-300 ${
                filter === f
                  ? "glass text-amber border border-amber/15"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {f === "tutto" ? "Tutto" : f === "diario" ? "Diario" : "Mood"}
            </button>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateKey, items]) => (
            <div key={dateKey}>
              <div className="text-[10px] text-text-muted font-ui tracking-[0.15em] mb-3 capitalize">{dateKey}</div>
              <div className="space-y-3">
                <AnimatePresence>
                  {items.map((item) => {
                    if (item.type === "journal") {
                      const j = item.data as JournalEntry;
                      const isExpanded = expandedReflection === j.id;
                      return (
                        <motion.div
                          key={j.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ease: premium }}
                          className="glass rounded-xl p-4"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <span className="text-amber text-xs shrink-0 mt-0.5">&#9790;</span>
                            {j.content.length > 80 && !expandedEntries.has(j.id) ? (
                              <p
                                className="text-sm text-text-primary font-body leading-relaxed cursor-pointer"
                                onClick={() => setExpandedEntries((prev) => new Set(prev).add(j.id))}
                              >
                                {j.content.slice(0, 80)}...
                              </p>
                            ) : (
                              <p className="text-sm text-text-primary font-body leading-relaxed">{j.content}</p>
                            )}
                          </div>
                          {j.aiReflection && (
                            <>
                              <button
                                onClick={() => setExpandedReflection(isExpanded ? null : j.id)}
                                className="text-[10px] text-verdigris font-ui tracking-wide mt-2 mb-1"
                              >
                                {isExpanded ? "◆ Chiudi riflessione" : "◆ Riflessione cosmica"}
                              </button>
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ ease: premium }}
                                    className="overflow-hidden"
                                  >
                                    <div className="pt-2 pl-5 border-l border-verdigris/20 ml-1">
                                      <MarkdownText
                                        content={j.aiReflection}
                                        className="text-sm text-text-secondary font-body italic leading-relaxed"
                                      />
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}
                          <div className="text-[10px] text-text-muted font-ui mt-2">
                            {new Date(j.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </motion.div>
                      );
                    } else {
                      const c = item.data as CheckinEntry;
                      return (
                        <motion.div
                          key={c.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ ease: premium }}
                          className="glass rounded-xl p-4 flex items-center gap-3"
                        >
                          <span
                            className={`text-xl ${c.mood >= 4 ? "text-amber" : c.mood >= 3 ? "text-text-muted" : "text-sienna"}`}
                            dangerouslySetInnerHTML={{ __html: moodSymbols[c.mood] || "&#9672;" }}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-display font-bold">{moodLabels[c.mood] || "Check-in"}</div>
                            <div className="text-[10px] text-text-muted font-ui">
                              Energia: {c.energy}/5 &middot;{" "}
                              {new Date(c.createdAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                            </div>
                          </div>
                          {c.aiInsight && (
                            <span className="text-[10px] text-verdigris font-ui">&#9670;</span>
                          )}
                        </motion.div>
                      );
                    }
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>

        {/* Il Filo entry point — visible with 3+ journal entries */}
        {journals.length >= 3 && (
          <Link
            href="/diario/il-filo"
            className="block glass rounded-xl p-5 border border-amber/10 transition-all duration-300 hover:border-amber/20 mb-6"
          >
            <div className="flex items-center gap-3">
              <span className="text-amber text-xl filo-pulse">&#10038;</span>
              <div className="flex-1">
                <div className="text-sm font-display font-bold">Il Filo</div>
                <div className="text-xs text-text-muted font-body italic">
                  Scopri i pattern nascosti nelle tue riflessioni
                </div>
              </div>
              <span className="text-text-muted text-xs">&#8594;</span>
            </div>
          </Link>
        )}

        {/* Empty state */}
        {timeline.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-4xl text-text-muted mb-4">&#9790;</div>
            <p className="text-text-muted font-body italic">Il tuo diario cosmico &egrave; vuoto.<br />Inizia a scrivere per scoprire i tuoi pattern.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
