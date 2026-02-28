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

const arcColors: Record<string, { border: string; text: string; bg: string }> = {
  FUOCO: { border: "border-sienna/20", text: "text-sienna", bg: "from-sienna/8 to-amber/5" },
  ACQUA: { border: "border-verdigris/20", text: "text-verdigris", bg: "from-verdigris/8 to-verdigris-dim/5" },
  STELLA: { border: "border-amber/20", text: "text-amber", bg: "from-amber/8 to-amber-glow/5" },
};

export default function VisionsPage() {
  const [topic, setTopic] = useState("");
  const [visions, setVisions] = useState<Vision[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const generateVisions = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true); setVisions([]);
    try {
      const res = await fetch("/api/visions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ topic }) });
      const data = await res.json();
      if (data.visions) setVisions(data.visions);
    } catch { /* */ } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen p-6 relative">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="text-4xl mb-4 text-verdigris">&#9672;</div>
          <h1 className="text-3xl md:text-4xl font-bold font-display mb-3"><span className="text-gradient">Tre Visioni del Destino</span></h1>
          <p className="text-text-secondary max-w-xl mx-auto font-body text-lg italic">
            Descrivi una decisione, un obiettivo, un&apos;area della tua vita.
            L&apos;AI incrocia il tuo cielo con il tuo profilo e genera tre futuri cosmici.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 mb-8">
          <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="es. Voglio cambiare carriera... La mia relazione è a un bivio..." rows={3} disabled={loading} />
          <div className="mt-4 flex justify-end">
            <Button onClick={generateVisions} disabled={!topic.trim() || loading} className="breathe">
              {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin" /> Le stelle parlano...</span> : "Genera le visioni cosmiche"}
            </Button>
          </div>
        </motion.div>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="text-5xl text-amber ember-pulse mb-4">&#9670;</div>
            <p className="text-text-secondary font-body italic text-lg">L&apos;AI sta consultando il tuo cielo...</p>
          </motion.div>
        )}

        <AnimatePresence>
          {visions.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {visions.map((v, i) => {
                const c = arcColors[v.archetype] || arcColors.STELLA;
                const open = expanded === i;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}
                    className={`rounded-2xl overflow-hidden border ${c.border} bg-gradient-to-br ${c.bg} transition-all duration-500 ${open ? "glow" : ""}`}>
                    <button onClick={() => setExpanded(open ? null : i)} className="w-full p-8 text-left">
                      <div className="flex items-start gap-4">
                        <div className="text-4xl">{v.emoji}</div>
                        <div className="flex-1">
                          <div className={`text-xs font-bold font-ui tracking-wider ${c.text} mb-1`}>
                            {v.archetype === "FUOCO" ? "&#9632; La Via del Fuoco" : v.archetype === "ACQUA" ? "&#9632; La Via dell'Acqua" : "&#9632; La Via della Stella"}
                          </div>
                          <h3 className="text-xl font-bold font-display">{v.title}</h3>
                          {!open && <p className="text-text-muted text-sm mt-2 font-ui">Tocca per esplorare &#8594;</p>}
                        </div>
                      </div>
                    </button>
                    <AnimatePresence>
                      {open && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-8 pb-8 space-y-6">
                            <div className="glass rounded-xl p-6">
                              <p className="text-text-secondary leading-relaxed italic font-body text-lg">{v.narrative}</p>
                            </div>
                            <div>
                              <h4 className={`text-xs font-bold font-ui tracking-wider ${c.text} mb-3`}>TAPPE COSMICHE</h4>
                              <div className="space-y-2">
                                {v.milestones?.map((m: string, j: number) => (
                                  <div key={j} className="flex items-start gap-3 text-sm font-body">
                                    <div className={`w-2 h-2 rounded-full mt-1.5 ${c.text} bg-current shrink-0`} />
                                    <span className="text-text-secondary">{m}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="glass rounded-xl p-6">
                              <h4 className={`text-xs font-bold font-ui tracking-wider ${c.text} mb-2`}>PERCHÉ LE STELLE DICONO QUESTO</h4>
                              <p className="text-text-muted text-sm leading-relaxed font-body">{v.reasoning}</p>
                            </div>
                            {v.cosmicAlignment && (
                              <div className="text-center glass rounded-xl p-4">
                                <span className="text-xs text-amber font-ui">&#9670; {v.cosmicAlignment}</span>
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
