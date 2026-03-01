"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Phase = "birth" | "questions" | "generating" | "complete";

interface ProfileData {
  awarenessScore: number;
  values: string[];
  blindSpots: string[];
  strengths: string[];
  shadows: string[];
  personalitySummary: string;
}

interface ChartData {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  coreIdentity: string;
  emotionalBlueprint: string;
  deepestWound: string;
}

const zodiac: Record<string, string> = {
  Ariete: "♈", Toro: "♉", Gemelli: "♊", Cancro: "♋",
  Leone: "♌", Vergine: "♍", Bilancia: "♎", Scorpione: "♏",
  Sagittario: "♐", Capricorno: "♑", Acquario: "♒", Pesci: "♓",
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

export default function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>("birth");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [step, setStep] = useState(0);
  const [messages, setMessages] = useState<{ type: "question" | "answer"; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentQuestion]);

  const handleBirthSubmit = async () => {
    if (!birthDate) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthTime, birthCity }),
      });
      const data = await res.json();
      setChartData(data.chart);
      setPhase("questions");
      const qRes = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: 0 }),
      });
      const qData = await qRes.json();
      setCurrentQuestion(qData.question);
      setMessages([{ type: "question", text: qData.question }]);
      setStep(1);
    } catch { /* */ } finally { setLoading(false); }
  };

  const handleAnswer = async () => {
    if (!currentAnswer.trim() || loading) return;
    setLoading(true);
    const answer = currentAnswer.trim();
    setCurrentAnswer("");
    setMessages((p) => [...p, { type: "answer", text: answer }]);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer, step }),
      });
      const data = await res.json();
      if (data.complete) {
        setPhase("complete");
        setProfileData(data.profile);
      } else {
        setCurrentQuestion(data.question);
        setMessages((p) => [...p, { type: "question", text: data.question }]);
        setStep(data.step);
      }
    } catch { /* */ } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="fixed inset-0 alchemy-bg pointer-events-none opacity-20" />

      <AnimatePresence mode="wait">
        {phase === "birth" && (
          <motion.div key="birth" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-lg mx-auto relative z-10">
            <div className="text-center mb-10">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }} className="text-5xl mb-6 text-amber">&#9670;</motion.div>
              <h1 className="text-3xl md:text-4xl font-bold font-display mb-3">
                Apri il tuo <span className="text-gradient">cielo</span>
              </h1>
              <p className="text-text-secondary font-body text-lg italic">Data, ora e luogo di nascita. Tutto inizia qui.</p>
            </div>
            <div className="glass rounded-2xl p-8 space-y-6">
              <div>
                <label className="text-sm text-text-secondary mb-2 block font-ui">Data di nascita *</label>
                <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block font-ui">
                  Ora di nascita <span className="text-text-muted">(precisione = accuratezza)</span>
                </label>
                <Input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block font-ui">
                  Città di nascita <span className="text-text-muted">(per il tuo ascendente)</span>
                </label>
                <Input type="text" placeholder="es. Milano, Roma, Napoli..." value={birthCity} onChange={(e) => setBirthCity(e.target.value)} />
              </div>
              <Button onClick={handleBirthSubmit} disabled={!birthDate || loading} className="w-full py-6 text-lg breathe">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-bg-base/30 border-t-bg-base rounded-full animate-spin" />
                    Calcolo il tuo cielo...
                  </span>
                ) : "Rivela il mio cielo"}
              </Button>
              <p className="text-center text-text-muted text-xs font-ui">&#9670; I tuoi dati di nascita non vengono mai condivisi.</p>
            </div>
          </motion.div>
        )}

        {phase === "questions" && (
          <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full max-w-2xl mx-auto relative z-10">
            {chartData && (
              <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass rounded-xl p-4 mb-6 flex items-center justify-center gap-6 text-sm font-ui">
                <span>{zodiac[chartData.sunSign] || "&#9788;"} Sole {chartData.sunSign}</span>
                <span className="text-border-light">&#183;</span>
                <span>&#9790; Luna {chartData.moonSign}</span>
                <span className="text-border-light">&#183;</span>
                <span>&#8593; Asc. {chartData.risingSign}</span>
              </motion.div>
            )}
            <div className="flex justify-center gap-2 mb-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div key={i} className={`w-3 h-3 rounded-full transition-all duration-500 ${
                  i < step ? "bg-amber ember-pulse" : "bg-bg-card"
                }`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05 }} />
              ))}
            </div>
            <div className="glass rounded-2xl p-6 h-[500px] overflow-y-auto mb-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.type === "answer" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.type === "answer"
                      ? "bg-amber/15 text-text-primary font-body text-lg"
                      : "bg-bg-card/50 text-text-secondary font-body text-lg italic"
                  }`}>
                    {msg.type === "question" && <span className="text-amber text-xs block mb-1 font-ui not-italic">&#9670; L&apos;oracolo chiede</span>}
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-bg-card/50 rounded-2xl px-5 py-3">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-3">
              <Input value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAnswer()} placeholder="La tua risposta..." disabled={loading} className="flex-1" />
              <Button onClick={handleAnswer} disabled={!currentAnswer.trim() || loading}>Invia</Button>
            </div>
          </motion.div>
        )}

        {phase === "complete" && (
          <motion.div key="complete" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mx-auto relative z-10">
            <div className="text-center mb-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-5xl mb-4 text-amber">&#9670;</motion.div>
              <h2 className="text-3xl font-bold font-display mb-2 text-gradient">Il tuo specchio alchemico</h2>
              <p className="text-text-secondary font-body italic text-lg">Ciò che le stelle e le tue parole rivelano</p>
            </div>
            {chartData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-8 mb-6">
                <h3 className="text-xl font-bold font-display text-gradient mb-6">Il Tuo Cielo</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { l: "Sole", s: chartData.sunSign },
                    { l: "Luna", s: chartData.moonSign },
                    { l: "Ascendente", s: chartData.risingSign },
                  ].map((x) => (
                    <div key={x.l} className="text-center glass rounded-xl p-4">
                      <div className="text-3xl mb-1">{zodiac[x.s] || "&#9670;"}</div>
                      <div className="text-xs text-text-muted font-ui">{x.l}</div>
                      <div className="font-bold font-display">{x.s}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <div className="glass rounded-xl p-4">
                    <div className="text-amber text-xs font-ui mb-1">La tua essenza</div>
                    <p className="text-text-secondary font-body text-lg italic">{chartData.coreIdentity}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-verdigris text-xs font-ui mb-1">Il tuo mondo emotivo</div>
                    <p className="text-text-secondary font-body text-lg italic">{chartData.emotionalBlueprint}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-sienna text-xs font-ui mb-1">La ferita che nasconde il tuo dono</div>
                    <p className="text-text-secondary font-body text-lg italic">{chartData.deepestWound}</p>
                  </div>
                </div>
              </motion.div>
            )}
            {profileData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold font-display text-gradient">Consapevolezza</h3>
                  <div className="text-3xl font-bold font-display text-amber">{profileData.awarenessScore}%</div>
                </div>
                <p className="text-text-secondary mb-6 leading-relaxed font-body text-lg italic">{profileData.personalitySummary}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <div className="text-sienna text-xs font-ui mb-2">Ombre attive</div>
                    {profileData.shadows?.map((s: string, i: number) => (
                      <div key={i} className="text-sm text-text-secondary font-body">&#9681; {s}</div>
                    ))}
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-amber text-xs font-ui mb-2">Doni nascosti</div>
                    {profileData.strengths?.map((s: string, i: number) => (
                      <div key={i} className="text-sm text-text-secondary font-body">&#9670; {s}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              <a href="/oggi"><Button className="w-full py-6 text-lg breathe">Entra nel tuo universo</Button></a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
