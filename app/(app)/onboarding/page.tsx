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
  socialMask: string;
  loveLanguage: string;
  lifeLesson: string;
  deepestWound: string;
  mythology: string;
}

export default function OnboardingPage() {
  const [phase, setPhase] = useState<Phase>("birth");

  // Birth data
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");

  // Questions
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
      // Generate birth chart
      const res = await fetch("/api/chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ birthDate, birthTime, birthCity }),
      });
      const data = await res.json();
      setChartData(data.chart);

      // Start questions
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
    } catch {
      console.error("Error starting onboarding");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async () => {
    if (!currentAnswer.trim() || loading) return;
    setLoading(true);

    const answer = currentAnswer.trim();
    setCurrentAnswer("");
    setMessages((prev) => [...prev, { type: "answer", text: answer }]);

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
        setMessages((prev) => [...prev, { type: "question", text: data.question }]);
        setStep(data.step);
      }
    } catch {
      console.error("Error in onboarding");
    } finally {
      setLoading(false);
    }
  };

  const zodiacEmojis: Record<string, string> = {
    Ariete: "♈", Toro: "♉", Gemelli: "♊", Cancro: "♋",
    Leone: "♌", Vergine: "♍", Bilancia: "♎", Scorpione: "♏",
    Sagittario: "♐", Capricorno: "♑", Acquario: "♒", Pesci: "♓",
    Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
    Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
    Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-20" />

      <AnimatePresence mode="wait">
        {/* PHASE 1: Birth Data */}
        {phase === "birth" && (
          <motion.div
            key="birth"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-lg mx-auto relative z-10"
          >
            <div className="text-center mb-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-6xl mb-6"
              >
                ✦
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Apri il tuo <span className="text-gradient-cosmic">cielo</span>
              </h1>
              <p className="text-text-secondary">
                Data, ora e luogo di nascita. Tutto inizia qui.
              </p>
            </div>

            <div className="glass rounded-2xl p-8 space-y-6">
              <div>
                <label className="text-sm text-text-secondary mb-2 block">Data di nascita *</label>
                <Input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  Ora di nascita <span className="text-text-muted">(più precisa = più accurato)</span>
                </label>
                <Input
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary mb-2 block">
                  Città di nascita <span className="text-text-muted">(per il tuo ascendente)</span>
                </label>
                <Input
                  type="text"
                  placeholder="es. Milano, Roma, Napoli..."
                  value={birthCity}
                  onChange={(e) => setBirthCity(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleBirthSubmit}
                  disabled={!birthDate || loading}
                  className="w-full py-6 text-lg cosmic-breathe"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Calcolo il tuo cielo...
                    </span>
                  ) : (
                    "Rivela il mio cielo"
                  )}
                </Button>
              </div>

              <p className="text-center text-text-muted text-xs mt-4">
                🔒 I tuoi dati di nascita restano sul tuo profilo. Non vengono mai condivisi.
              </p>
            </div>
          </motion.div>
        )}

        {/* PHASE 2: Questions */}
        {phase === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl mx-auto relative z-10"
          >
            {/* Chart summary bar */}
            {chartData && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="glass rounded-xl p-4 mb-6 flex items-center justify-center gap-6 text-sm"
              >
                <span>
                  {zodiacEmojis[chartData.sunSign] || "☀"} Sole {chartData.sunSign}
                </span>
                <span className="text-text-muted">|</span>
                <span>
                  {zodiacEmojis[chartData.moonSign] || "🌙"} Luna {chartData.moonSign}
                </span>
                <span className="text-text-muted">|</span>
                <span>
                  {zodiacEmojis[chartData.risingSign] || "⬆"} Asc. {chartData.risingSign}
                </span>
              </motion.div>
            )}

            {/* Progress */}
            <div className="flex justify-center gap-2 mb-8">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-500 ${
                    i < step
                      ? "bg-accent glow-pulse"
                      : i === step - 1
                        ? "bg-accent scale-125"
                        : "bg-bg-tertiary"
                  }`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                />
              ))}
            </div>

            {/* Chat */}
            <div className="glass rounded-2xl p-6 h-[500px] overflow-y-auto mb-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.type === "answer" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                      msg.type === "answer"
                        ? "bg-accent/20 text-text-primary"
                        : "bg-bg-tertiary/50 text-text-secondary"
                    }`}
                  >
                    {msg.type === "question" && (
                      <span className="text-accent text-xs block mb-1">✦ L&apos;oracolo chiede</span>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-bg-tertiary/50 rounded-2xl px-5 py-3">
                    <span className="flex gap-1">
                      <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <Input
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnswer()}
                placeholder="La tua risposta..."
                disabled={loading}
                className="flex-1"
              />
              <Button onClick={handleAnswer} disabled={!currentAnswer.trim() || loading}>
                Invia
              </Button>
            </div>
          </motion.div>
        )}

        {/* PHASE 3: Generating */}
        {phase === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center relative z-10"
          >
            <div className="text-6xl mb-6 glow-pulse">✦</div>
            <h2 className="text-2xl font-bold mb-4">L&apos;AI sta leggendo il tuo cielo...</h2>
            <p className="text-text-secondary">Sto incrociando il tuo tema natale con le tue risposte</p>
          </motion.div>
        )}

        {/* PHASE 4: Complete */}
        {phase === "complete" && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl mx-auto relative z-10"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="text-6xl mb-4"
              >
                ✦
              </motion.div>
              <h2 className="text-3xl font-bold mb-2">Il tuo specchio cosmico</h2>
              <p className="text-text-secondary">Questo è ciò che le stelle e le tue parole rivelano</p>
            </div>

            {/* Chart */}
            {chartData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass rounded-2xl p-8 mb-6"
              >
                <h3 className="text-xl font-bold text-gradient-cosmic mb-6">Il Tuo Cielo</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center glass rounded-xl p-4">
                    <div className="text-3xl mb-1">{zodiacEmojis[chartData.sunSign] || "☀"}</div>
                    <div className="text-sm text-text-muted">Sole</div>
                    <div className="font-bold">{chartData.sunSign}</div>
                  </div>
                  <div className="text-center glass rounded-xl p-4">
                    <div className="text-3xl mb-1">{zodiacEmojis[chartData.moonSign] || "🌙"}</div>
                    <div className="text-sm text-text-muted">Luna</div>
                    <div className="font-bold">{chartData.moonSign}</div>
                  </div>
                  <div className="text-center glass rounded-xl p-4">
                    <div className="text-3xl mb-1">{zodiacEmojis[chartData.risingSign] || "⬆"}</div>
                    <div className="text-sm text-text-muted">Ascendente</div>
                    <div className="font-bold">{chartData.risingSign}</div>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="glass rounded-xl p-4">
                    <div className="text-accent text-xs mb-1">La tua essenza</div>
                    <p className="text-text-secondary">{chartData.coreIdentity}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-accent text-xs mb-1">Il tuo mondo emotivo</div>
                    <p className="text-text-secondary">{chartData.emotionalBlueprint}</p>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-accent text-xs mb-1">La ferita che nasconde il tuo dono</div>
                    <p className="text-text-secondary">{chartData.deepestWound}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile */}
            {profileData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass rounded-2xl p-8 mb-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gradient-cosmic">Consapevolezza</h3>
                  <div className="text-3xl font-bold text-accent">{profileData.awarenessScore}%</div>
                </div>

                <p className="text-text-secondary mb-6 leading-relaxed">{profileData.personalitySummary}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4">
                    <div className="text-accent text-xs mb-2">Ombre attive</div>
                    <div className="space-y-1">
                      {profileData.shadows?.map((s: string, i: number) => (
                        <div key={i} className="text-sm text-text-secondary">🌑 {s}</div>
                      ))}
                    </div>
                  </div>
                  <div className="glass rounded-xl p-4">
                    <div className="text-accent-gold text-xs mb-2">Doni nascosti</div>
                    <div className="space-y-1">
                      {profileData.strengths?.map((s: string, i: number) => (
                        <div key={i} className="text-sm text-text-secondary">✦ {s}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <a href="/dashboard">
                <Button className="w-full py-6 text-lg cosmic-breathe">
                  Entra nel tuo universo
                </Button>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
