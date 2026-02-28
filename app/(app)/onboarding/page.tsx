"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

interface Message {
  role: "ai" | "user";
  content: string;
}

export default function OnboardingPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [profile, setProfile] = useState<{
    awarenessScore: number;
    values: string[];
    blindSpots: string[];
    strengths: string[];
    personalitySummary: string;
  } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Start the onboarding
    fetchNextQuestion(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchNextQuestion(currentStep: number, answer?: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ step: currentStep, answer }),
      });
      const data = await res.json();

      if (data.complete) {
        setComplete(true);
        setProfile(data.profile);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: data.question }]);
        setStep(data.step);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Mi dispiace, qualcosa è andato storto. Riprova." },
      ]);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const answer = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: answer }]);
    await fetchNextQuestion(step, answer);
  }

  if (complete && profile) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-10">
            <div className="text-6xl mb-4">🪞</div>
            <h1 className="text-3xl font-bold mb-2">Il tuo specchio</h1>
            <p className="text-text-secondary">Ecco cosa ha rivelato la scoperta</p>
          </div>

          {/* Awareness Score */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-8 text-center mb-6"
          >
            <div className="text-sm text-text-muted mb-2 uppercase tracking-wider">
              Awareness Score
            </div>
            <div className="text-7xl font-bold text-gradient glow-pulse">
              {profile.awarenessScore}
            </div>
            <div className="text-text-muted text-sm mt-1">/ 100</div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-sm font-semibold text-success mb-3 uppercase tracking-wider">
                Punti di forza
              </h3>
              <ul className="space-y-2">
                {profile.strengths.map((s: string) => (
                  <li key={s} className="text-text-secondary text-sm flex items-start gap-2">
                    <span className="text-success mt-0.5">+</span> {s}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Blind Spots */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass rounded-2xl p-6"
            >
              <h3 className="text-sm font-semibold text-warning mb-3 uppercase tracking-wider">
                Punti ciechi
              </h3>
              <ul className="space-y-2">
                {profile.blindSpots.map((b: string) => (
                  <li key={b} className="text-text-secondary text-sm flex items-start gap-2">
                    <span className="text-warning mt-0.5">!</span> {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Values */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass rounded-2xl p-6 mb-6"
          >
            <h3 className="text-sm font-semibold text-accent mb-3 uppercase tracking-wider">
              I tuoi valori core
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.values.map((v: string) => (
                <span
                  key={v}
                  className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm border border-accent/20"
                >
                  {v}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass rounded-2xl p-6 mb-8"
          >
            <h3 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-wider">
              Chi sei
            </h3>
            <p className="text-text-secondary leading-relaxed">
              {profile.personalitySummary}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <Button size="lg" onClick={() => router.push("/dashboard")}>
              Vai alla Dashboard
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col h-[calc(100vh-theme(spacing.32))] md:h-[calc(100vh-theme(spacing.20))]">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">La Scoperta</h1>
        <p className="text-text-muted text-sm">
          Domanda {step} di 10
        </p>
        {/* Progress orbs */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                i < step
                  ? "bg-accent shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                  : "bg-bg-tertiary"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-accent text-white rounded-br-md"
                    : "glass rounded-bl-md"
                }`}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="glass px-5 py-3.5 rounded-2xl rounded-bl-md">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 rounded-full bg-accent/50 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Scrivi la tua risposta..."
          rows={2}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          className="self-end"
        >
          Invia
        </Button>
      </form>
    </div>
  );
}
