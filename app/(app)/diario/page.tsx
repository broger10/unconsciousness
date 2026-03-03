"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const premium = [0.16, 1, 0.3, 1] as const;

type MirrorState = "loading" | "ritual" | "complete" | "error";
type RitualPhase =
  | "entering"
  | "question"
  | "answering"
  | "reflecting"
  | "descending"
  | "ending";

interface MirrorOptions {
  opening: string;
  resistance: string;
  uncertainty: string;
}

interface AnswerData {
  id: string;
  depth: number;
  question: string;
  options: MirrorOptions;
  answerChosen?: string | null;
  answerFree?: string | null;
  reflection?: string | null;
}

function getWarmth(count: number): string | undefined {
  if (count < 10) return undefined;
  if (count < 30) return "cool";
  if (count < 60) return "neutral";
  if (count < 120) return "warm";
  return "deep";
}

/* ── Slow word reveal for Specchio ── */
function SpecchioWordReveal({
  text,
  delayStart = 0,
  onComplete,
  className = "",
}: {
  text: string;
  delayStart?: number;
  onComplete?: () => void;
  className?: string;
}) {
  const words = text.split(" ");
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return;
    const totalMs = delayStart + words.length * 200 + 600;
    const t = setTimeout(() => {
      completedRef.current = true;
      onComplete?.();
    }, totalMs);
    return () => clearTimeout(t);
  }, [delayStart, words.length, onComplete]);

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="inline-block specchio-word-reveal mr-[0.35em]"
          style={{ animationDelay: `${delayStart + i * 200}ms` }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}

export default function DiarioPage() {
  const [state, setState] = useState<MirrorState>("loading");
  const [phase, setPhase] = useState<RitualPhase>("entering");
  const [warmth, setWarmth] = useState<string | undefined>(undefined);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState<AnswerData | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFreeText, setShowFreeText] = useState(false);
  const [freeText, setFreeText] = useState("");
  const [reflection, setReflection] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lineKey, setLineKey] = useState(0);

  const generateFirstQuestion = useCallback(async () => {
    setState("ritual");
    setPhase("entering");

    try {
      const res = await fetch("/api/mirror/generate", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setState("error");
        return;
      }

      setSessionId(data.sessionId);
      const answerData: AnswerData = {
        id: data.answerId,
        depth: 1,
        question: data.question,
        options: data.options,
      };
      setCurrentAnswer(answerData);
      setAnswers([answerData]);

      // Entering animation then show question
      setTimeout(() => setPhase("question"), 1500);
    } catch {
      setState("error");
    }
  }, []);

  // Load session on mount
  useEffect(() => {
    fetch("/api/mirror/session")
      .then((r) => r.json())
      .then((d) => {
        setWarmth(getWarmth(d.totalAnswerCount || 0));

        if (d.status === "COMPLETE") {
          setSessionId(d.session?.id || null);
          setAnswers(d.answers || []);
          setState("complete");
        } else if (d.status === "IN_PROGRESS") {
          setSessionId(d.session?.id || null);
          setAnswers(d.answers || []);
          // Find the last unanswered question
          const unanswered = (d.answers || []).find(
            (a: AnswerData) => !a.answerChosen && !a.answerFree
          );
          if (unanswered) {
            setCurrentAnswer(unanswered);
            setState("ritual");
            setPhase("question");
          } else {
            // All answered but session not complete — show last reflection
            const lastAnswered = d.answers[d.answers.length - 1];
            if (lastAnswered?.reflection) {
              setReflection(lastAnswered.reflection);
              setCurrentAnswer(lastAnswered);
              setState("ritual");
              setPhase("reflecting");
            } else {
              setState("complete");
            }
          }
        } else {
          // NEW — generate first question
          generateFirstQuestion();
        }
      })
      .catch(() => setState("error"));
  }, [generateFirstQuestion]);

  const submitAnswer = useCallback(
    async (answerText: string, isFreeText: boolean) => {
      if (!currentAnswer || submitting) return;

      setSelectedOption(isFreeText ? "__free__" : answerText);
      setSubmitting(true);

      // Pulse the line
      setLineKey((k) => k + 1);

      try {
        const res = await fetch("/api/mirror/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answerId: currentAnswer.id,
            answerChosen: isFreeText ? null : answerText,
            answerFree: isFreeText ? answerText : null,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setSubmitting(false);
          return;
        }

        // Update the current answer in state
        const updatedAnswer = {
          ...currentAnswer,
          answerChosen: isFreeText ? null : answerText,
          answerFree: isFreeText ? answerText : null,
          reflection: data.reflection,
        };
        setAnswers((prev) =>
          prev.map((a) => (a.id === currentAnswer.id ? updatedAnswer : a))
        );

        setReflection(data.reflection);
        setPhase("reflecting");

        if (data.sessionComplete) {
          // After showing reflection, go to ending
          setTimeout(() => {
            setPhase("ending");
            setTimeout(() => setState("complete"), 3000);
          }, 4000);
        } else if (data.nextQuestion && data.nextOptions) {
          // Store next question for descent
          const nextAnswer: AnswerData = {
            id: data.answerId,
            depth: data.depth,
            question: data.nextQuestion,
            options: data.nextOptions,
          };
          setAnswers((prev) => [...prev, nextAnswer]);
        }
      } catch {
        // silently fail
      } finally {
        setSubmitting(false);
      }
    },
    [currentAnswer, submitting]
  );

  const descend = useCallback(() => {
    // Find the next unanswered question
    const next = answers.find((a) => !a.answerChosen && !a.answerFree);
    if (!next) return;

    setSelectedOption(null);
    setShowFreeText(false);
    setFreeText("");
    setReflection(null);
    setCurrentAnswer(next);
    setPhase("descending");

    setTimeout(() => setPhase("question"), 800);
  }, [answers]);

  const stopSession = useCallback(async () => {
    if (!sessionId) return;
    await fetch("/api/mirror/stop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    });
    setPhase("ending");
    setTimeout(() => setState("complete"), 3000);
  }, [sessionId]);

  const handleFreeTextSubmit = () => {
    if (!freeText.trim()) return;
    submitAnswer(freeText.trim(), true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleFreeTextSubmit();
    }
  };

  // Check if there's a next question available for descent
  const hasNextQuestion = answers.some(
    (a) => !a.answerChosen && !a.answerFree
  );

  const optionsList = currentAnswer
    ? [
        currentAnswer.options.opening,
        currentAnswer.options.resistance,
        currentAnswer.options.uncertainty,
      ]
    : [];

  const flowClass =
    phase === "ending"
      ? "specchio-slowing"
      : state === "complete"
        ? ""
        : "specchio-flowing";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: premium }}
      className={`min-h-screen specchio-bg ${flowClass} flex flex-col relative overflow-hidden`}
      data-warmth={warmth}
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute top-5 left-0 right-0 text-center z-10"
      >
        <span className="text-[10px] tracking-[0.3em] font-ui uppercase text-[#F0E6C8]/20">
          <span className="text-amber/40">un</span>consciousness
        </span>
      </motion.div>

      {/* ── LOADING ── */}
      {state === "loading" && (
        <div className="flex-1 flex items-center justify-center">
          <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-[1px] bg-gradient-to-r from-transparent via-amber/40 to-transparent"
          />
        </div>
      )}

      {/* ── ERROR ── */}
      {state === "error" && (
        <div className="flex-1 flex items-center justify-center px-8">
          <p className="text-[#F0E6C8]/40 text-sm font-body text-center">
            Qualcosa non ha funzionato. Riprova tra poco.
          </p>
        </div>
      )}

      {/* ── RITUAL ── */}
      {state === "ritual" && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 pt-16 relative">
          <AnimatePresence mode="wait">
            {/* Entering phase — just the line appearing */}
            {phase === "entering" && (
              <motion.div
                key="entering"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-x-0 top-[40%]"
              >
                <div className="specchio-line mx-6" />
              </motion.div>
            )}

            {/* Question + Answering + Reflecting */}
            {(phase === "question" ||
              phase === "answering" ||
              phase === "reflecting" ||
              phase === "descending") &&
              currentAnswer && (
                <motion.div
                  key={`depth-${currentAnswer.depth}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.6, ease: premium }}
                  className="w-full max-w-md flex flex-col items-center"
                >
                  {/* Reflection (above line) */}
                  {phase === "reflecting" && reflection && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: premium }}
                      className="text-center mb-8 px-4"
                    >
                      <p className="text-[#F0E6C8]/60 text-sm font-body italic leading-relaxed">
                        {reflection}
                      </p>
                    </motion.div>
                  )}

                  {/* Question (above line) */}
                  <div className="text-center mb-6 px-2">
                    {phase === "reflecting" ? (
                      <p
                        className="font-display text-[#F0E6C8]/30 leading-tight"
                        style={{ fontSize: "clamp(24px, 6vw, 40px)" }}
                      >
                        {currentAnswer.question}
                      </p>
                    ) : (
                      <h1
                        className="font-display text-[#F0E6C8] leading-tight"
                        style={{ fontSize: "clamp(28px, 8vw, 56px)" }}
                      >
                        <SpecchioWordReveal
                          text={currentAnswer.question}
                          delayStart={phase === "descending" ? 800 : 200}
                          onComplete={() => {
                            if (phase === "question") setPhase("answering");
                          }}
                        />
                      </h1>
                    )}
                  </div>

                  {/* Water line */}
                  <motion.div
                    key={`line-${lineKey}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      delay: 0.3,
                      duration: 0.8,
                      ease: premium,
                    }}
                    className={`w-full mb-8 ${lineKey > 0 ? "specchio-line-pulse" : "specchio-line"}`}
                    style={{ height: 1 }}
                  />

                  {/* Answer options (below line) */}
                  {(phase === "answering" || phase === "question") &&
                    !selectedOption && (
                      <div className="w-full space-y-3">
                        {optionsList.map((opt, i) => (
                          <motion.button
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.3 + i * 0.12,
                              ease: premium,
                            }}
                            onClick={() => submitAnswer(opt, false)}
                            disabled={submitting || phase === "question"}
                            className="w-full text-left p-4 rounded-xl border border-[#F0E6C8]/8 font-body text-[15px] text-[#F0E6C8]/70 leading-relaxed hover:border-[#F0E6C8]/20 hover:text-[#F0E6C8]/90 transition-all duration-300"
                          >
                            {opt}
                          </motion.button>
                        ))}

                        {!showFreeText ? (
                          <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            onClick={() => setShowFreeText(true)}
                            className="w-full text-center text-[11px] text-[#F0E6C8]/25 font-ui mt-2 py-2 hover:text-[#F0E6C8]/40 transition-colors"
                          >
                            Rispondi a modo tuo
                          </motion.button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-2"
                          >
                            <div className="relative">
                              <input
                                type="text"
                                value={freeText}
                                onChange={(e) => setFreeText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Scrivi..."
                                autoFocus
                                className="w-full bg-transparent border-b border-[#F0E6C8]/15 focus:border-[#F0E6C8]/30 text-[#F0E6C8]/70 text-sm font-body py-3 placeholder:text-[#F0E6C8]/15 focus:outline-none transition-colors"
                              />
                              {freeText.trim() && (
                                <button
                                  onClick={handleFreeTextSubmit}
                                  className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F0E6C8]/30 hover:text-[#F0E6C8]/60 transition-colors text-xs font-ui"
                                >
                                  &rarr;
                                </button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )}

                  {/* Selected answer shown */}
                  {selectedOption && phase !== "reflecting" && (
                    <div className="w-full space-y-3">
                      {optionsList.map((opt, i) => (
                        <motion.div
                          key={i}
                          animate={
                            (selectedOption === opt ||
                              (selectedOption === "__free__" && i === 0))
                              ? {}
                              : { opacity: 0, y: 20 }
                          }
                          transition={{ duration: 0.5, ease: premium }}
                          className={`p-4 rounded-xl border border-[#F0E6C8]/8 font-body text-[15px] leading-relaxed ${
                            selectedOption === opt
                              ? "specchio-chosen text-[#F0E6C8]"
                              : "text-[#F0E6C8]/70"
                          }`}
                        >
                          {selectedOption === "__free__" && i === 0
                            ? freeText
                            : opt}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Reflecting phase — descent or stop buttons */}
                  {phase === "reflecting" && !submitting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 2 }}
                      className="flex flex-col items-center gap-3 mt-8"
                    >
                      {hasNextQuestion && (
                        <button
                          onClick={descend}
                          className="text-sm font-display text-[#F0E6C8]/50 hover:text-[#F0E6C8]/80 transition-colors py-2 px-6 rounded-xl border border-[#F0E6C8]/10 hover:border-[#F0E6C8]/20"
                        >
                          Scendi pi&ugrave; in profondit&agrave;
                        </button>
                      )}
                      <button
                        onClick={stopSession}
                        className="text-[10px] font-ui text-[#F0E6C8]/20 hover:text-[#F0E6C8]/40 transition-colors tracking-widest"
                      >
                        fermati qui
                      </button>
                    </motion.div>
                  )}

                  {/* Submitting indicator */}
                  {submitting && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8"
                    >
                      <motion.div
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-[1px] bg-gradient-to-r from-transparent via-amber/30 to-transparent"
                      />
                    </motion.div>
                  )}
                </motion.div>
              )}

            {/* Ending phase */}
            {phase === "ending" && (
              <motion.div
                key="ending"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="text-center"
              >
                <p className="specchio-end-text font-display text-[#F0E6C8] text-lg tracking-wider">
                  Hai guardato dentro oggi.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── COMPLETE (summary) ── */}
      {state === "complete" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="flex-1 flex flex-col items-center px-6 pb-24 pt-20"
        >
          <div className="w-full max-w-md space-y-8">
            {answers
              .filter((a) => a.answerChosen || a.answerFree)
              .map((a, i) => (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.3, ease: premium }}
                >
                  {/* Question */}
                  <p
                    className="font-display text-[#F0E6C8]/40 leading-tight mb-3"
                    style={{
                      fontSize:
                        i === 0
                          ? "clamp(22px, 6vw, 36px)"
                          : "clamp(18px, 4vw, 28px)",
                    }}
                  >
                    {a.question}
                  </p>

                  {/* Answer */}
                  <p className="text-[#F0E6C8]/60 text-sm font-body mb-2 pl-3 border-l border-[#F0E6C8]/10">
                    {a.answerFree || a.answerChosen}
                  </p>

                  {/* Reflection */}
                  {a.reflection && (
                    <p className="text-[#F0E6C8]/30 text-xs font-body italic mt-2">
                      {a.reflection}
                    </p>
                  )}

                  {/* Divider */}
                  {i <
                    answers.filter((aa) => aa.answerChosen || aa.answerFree)
                      .length -
                      1 && (
                    <div className="mt-6 mx-auto w-8 h-[1px] bg-gradient-to-r from-transparent via-[#F0E6C8]/15 to-transparent" />
                  )}
                </motion.div>
              ))}

            {/* End message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{
                delay: 0.3 + answers.length * 0.3 + 0.5,
                duration: 1,
              }}
              className="text-center font-display text-[#F0E6C8] text-sm tracking-wider mt-12"
            >
              Hai guardato dentro oggi.
            </motion.p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
