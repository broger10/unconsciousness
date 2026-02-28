"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Vision {
  title: string;
  emoji: string;
  archetype: string;
  narrative: string;
  milestones: string[];
  reasoning: string;
  cosmicAlignment: string;
}

const archetypeColors: Record<string, { bg: string; border: string; text: string }> = {
  FUOCO: { bg: "bg-fire/5", border: "border-fire/20", text: "text-fire" },
  ACQUA: { bg: "bg-water/5", border: "border-water/20", text: "text-water" },
  STELLA: { bg: "bg-star/5", border: "border-star/20", text: "text-star" },
};

export default function VisionsPage() {
  const [topic, setTopic] = useState("");
  const [visions, setVisions] = useState<Vision[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const generateVisions = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setVisions([]);

    try {
      const res = await fetch("/api/visions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (data.visions) setVisions(data.visions);
    } catch {
      console.error("Error generating visions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 relative">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-4xl mb-4">🔮</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="text-gradient-cosmic">Tre Visioni del Destino</span>
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto">
            Descrivi una decisione, un obiettivo, un&apos;area della tua vita.
            L&apos;AI incrocia il tuo cielo con il tuo profilo e genera tre futuri cosmici.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-8"
        >
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="es. Voglio cambiare carriera... Sto pensando di trasferirmi... La mia relazione è a un bivio..."
            rows={3}
            disabled={loading}
          />
          <div className="mt-4 flex justify-end">
            <Button
              onClick={generateVisions}
              disabled={!topic.trim() || loading}
              className="cosmic-breathe"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Le stelle stanno parlando...
                </span>
              ) : (
                "Genera le visioni cosmiche"
              )}
            </Button>
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-5xl glow-pulse mb-4">✦</div>
            <p className="text-text-secondary">L&apos;AI sta consultando il tuo cielo...</p>
            <p className="text-text-muted text-sm mt-2">Incrocio tema natale, ombre e transiti</p>
          </motion.div>
        )}

        {/* Visions */}
        <AnimatePresence>
          {visions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {visions.map((vision, i) => {
                const colors = archetypeColors[vision.archetype] || archetypeColors.STELLA;
                const isExpanded = expanded === i;

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.2 }}
                    className={`glass rounded-2xl overflow-hidden border ${colors.border} transition-all duration-500 ${isExpanded ? "glow" : ""}`}
                  >
                    {/* Header */}
                    <button
                      onClick={() => setExpanded(isExpanded ? null : i)}
                      className="w-full p-8 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{vision.emoji}</div>
                        <div className="flex-1">
                          <div className={`text-xs font-medium ${colors.text} mb-1`}>
                            {vision.archetype === "FUOCO" ? "🔥 La Via del Fuoco" :
                              vision.archetype === "ACQUA" ? "💧 La Via dell'Acqua" :
                                "⭐ La Via della Stella"}
                          </div>
                          <h3 className="text-xl font-bold">{vision.title}</h3>
                          {!isExpanded && (
                            <p className="text-text-muted text-sm mt-2">
                              Clicca per esplorare questa visione →
                            </p>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-8 pb-8 space-y-6">
                            {/* Narrative */}
                            <div className={`${colors.bg} rounded-xl p-6`}>
                              <p className="text-text-secondary leading-relaxed italic">
                                {vision.narrative}
                              </p>
                            </div>

                            {/* Milestones */}
                            <div>
                              <h4 className={`text-sm font-medium ${colors.text} mb-3`}>
                                Tappe cosmiche
                              </h4>
                              <div className="space-y-2">
                                {vision.milestones?.map((m: string, j: number) => (
                                  <div key={j} className="flex items-start gap-3 text-sm">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${colors.text} bg-current shrink-0`} />
                                    <span className="text-text-secondary">{m}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Reasoning */}
                            <div className="glass rounded-xl p-6">
                              <h4 className={`text-sm font-medium ${colors.text} mb-2`}>
                                Perché le stelle dicono questo
                              </h4>
                              <p className="text-text-muted text-sm leading-relaxed">
                                {vision.reasoning}
                              </p>
                            </div>

                            {/* Cosmic alignment */}
                            {vision.cosmicAlignment && (
                              <div className="text-center glass rounded-xl p-4">
                                <span className="text-xs text-accent">
                                  ✦ {vision.cosmicAlignment}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
