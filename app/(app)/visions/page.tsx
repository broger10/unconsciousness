"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface Vision {
  id: string;
  title: string;
  emoji: string;
  narrative: string;
  milestones: string[];
  reasoning: string;
  versionNumber: number;
}

const pathColors = [
  { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", label: "Il Percorso Audace" },
  { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", label: "Il Percorso Saggio" },
  { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", label: "Il Percorso Profondo" },
];

export default function VisionsPage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [visions, setVisions] = useState<Vision[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || loading) return;

    setLoading(true);
    setVisions([]);
    setExpanded(null);

    try {
      const res = await fetch("/api/visions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });
      const data = await res.json();
      if (data.visions) {
        setVisions(data.visions);
      }
    } catch {
      // handle error
    }
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Le Tre Visioni</h1>
        <p className="text-text-secondary">
          Descrivi un obiettivo, una decisione o un&apos;area della tua vita.
          L&apos;AI creerà 3 futuri possibili, ognuno perfetto per te.
        </p>
      </motion.div>

      {/* Input */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleGenerate}
        className="mb-10"
      >
        <Card variant="glass" className="space-y-4">
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Es: Voglio cambiare lavoro, ma ho paura di lasciare la stabilità..."
            rows={3}
            className="bg-transparent border-0 focus:ring-0 text-base"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !topic.trim()}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generando le visioni...
                </span>
              ) : (
                "Genera 3 Visioni"
              )}
            </Button>
          </div>
        </Card>
      </motion.form>

      {/* Loading */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="flex justify-center gap-3 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full bg-accent float"
                style={{ animationDelay: `${i * 0.4}s` }}
              />
            ))}
          </div>
          <p className="text-text-secondary">
            Sto esplorando 3 futuri possibili per te...
          </p>
        </motion.div>
      )}

      {/* Visions */}
      <AnimatePresence>
        {visions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-text-secondary mb-4">
              I tuoi 3 futuri
            </h2>

            {visions.map((vision, i) => {
              const color = pathColors[i] || pathColors[0];
              const isExpanded = expanded === i;

              return (
                <motion.div
                  key={vision.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                >
                  <div
                    className={`rounded-2xl border ${color.border} ${color.bg} p-6 cursor-pointer transition-all duration-500 hover:shadow-lg`}
                    onClick={() => setExpanded(isExpanded ? null : i)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{vision.emoji}</span>
                        <div>
                          <div className={`text-xs font-medium ${color.text} uppercase tracking-wider mb-1`}>
                            {color.label}
                          </div>
                          <h3 className="text-xl font-bold">{vision.title}</h3>
                        </div>
                      </div>
                      <div
                        className={`text-text-muted transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </div>
                    </div>

                    {/* Preview */}
                    {!isExpanded && (
                      <p className="text-text-secondary text-sm mt-3 line-clamp-2">
                        {vision.narrative}
                      </p>
                    )}

                    {/* Expanded */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          {/* Narrative */}
                          <div className="mt-4 mb-6">
                            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                              La tua storia
                            </h4>
                            <p className="text-text-secondary leading-relaxed whitespace-pre-line">
                              {vision.narrative}
                            </p>
                          </div>

                          {/* Milestones */}
                          <div className="mb-6">
                            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                              Milestones
                            </h4>
                            <div className="space-y-3">
                              {vision.milestones.map((m, mi) => (
                                <div key={mi} className="flex items-start gap-3">
                                  <div className={`w-2 h-2 rounded-full ${color.text.replace("text-", "bg-")} mt-1.5 shrink-0`} />
                                  <span className="text-sm text-text-secondary">{m}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Reasoning */}
                          <div className="glass rounded-xl p-4">
                            <h4 className="text-xs font-semibold text-accent uppercase tracking-wider mb-2">
                              Perché questa visione è per te
                            </h4>
                            <p className="text-sm text-text-secondary leading-relaxed">
                              {vision.reasoning}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
