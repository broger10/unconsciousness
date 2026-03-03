"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { KalpavrikshaTree } from "@/components/filo/kalpavriksha-tree";

type FiloState = "idle" | "selected" | "loading" | "revealed" | "limited";

const PRESET_EMOTIONS = [
  "rabbia",
  "paura",
  "vergogna",
  "confusione",
  "dolore",
  "vuoto",
  "ansia",
  "solitudine",
];

const premium = [0.16, 1, 0.3, 1] as const;

/* ── Word-by-word reveal ── */
function WordReveal({
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
    const totalMs = delayStart + words.length * 120 + 400;
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
          className="inline-block opacity-0 word-reveal"
          style={{ animationDelay: `${delayStart + i * 120}ms` }}
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  );
}

export default function FiloPage() {
  const [state, setState] = useState<FiloState>("idle");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [customEmotion, setCustomEmotion] = useState("");
  const [result, setResult] = useState<{
    branchText: string;
    trunkText: string;
    rootText: string;
  } | null>(null);
  const [limitMessage, setLimitMessage] = useState("");
  const [revealPhase, setRevealPhase] = useState(0); // 0=branch, 1=trunk, 2=root
  const [sessionsToday, setSessionsToday] = useState(0);

  // Check daily count on mount
  useEffect(() => {
    fetch("/api/filo/ritual")
      .then((r) => r.json())
      .then((d) => {
        setSessionsToday(d.count || 0);
        if (!d.canStart) {
          setState("limited");
          setLimitMessage(
            "Hai già attraversato molto oggi. Adesso resta con quello che hai trovato."
          );
        }
      })
      .catch(() => {});
  }, []);

  const submitEmotion = useCallback(
    async (emotion: string) => {
      if (!emotion.trim() || state === "loading") return;

      setSelectedEmotion(emotion);
      setState("loading");

      try {
        const res = await fetch("/api/filo/ritual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emotion: emotion.trim() }),
        });
        const data = await res.json();

        if (data.limited) {
          setState("limited");
          setLimitMessage(
            data.message ||
              "Hai già attraversato molto oggi. Adesso resta con quello che hai trovato."
          );
          return;
        }

        if (data.error) {
          setState("idle");
          return;
        }

        setResult(data);
        setRevealPhase(0);
        setState("revealed");
        setSessionsToday((c) => c + 1);
      } catch {
        setState("idle");
      }
    },
    [state]
  );

  const handlePresetClick = (emotion: string) => {
    if (state !== "idle") return;
    setState("selected");
    setSelectedEmotion(emotion);
    // Small delay then submit
    setTimeout(() => submitEmotion(emotion), 600);
  };

  const handleCustomSubmit = () => {
    if (!customEmotion.trim() || state !== "idle") return;
    setState("selected");
    setSelectedEmotion(customEmotion.trim());
    setTimeout(() => submitEmotion(customEmotion.trim()), 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCustomSubmit();
    }
  };

  const reset = () => {
    setState("idle");
    setSelectedEmotion("");
    setCustomEmotion("");
    setResult(null);
    setRevealPhase(0);
  };

  const isIdle = state === "idle";
  const isSelected = state === "selected";
  const isLoading = state === "loading";
  const isRevealed = state === "revealed";
  const isLimited = state === "limited";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: premium }}
      className="min-h-screen filo-bg flex flex-col items-center relative overflow-hidden"
    >
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute top-6 left-0 right-0 text-center z-10"
      >
        <span className="text-[10px] tracking-[0.3em] font-ui uppercase text-[#F0E6C8]/30">
          <span className="text-[#F0E6C8]/50">un</span>consciousness
        </span>
      </motion.div>

      {/* Tree — always visible, centered */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <KalpavrikshaTree
          className="w-[85vw] max-w-[400px] h-auto opacity-40"
          breathing={isIdle || isRevealed}
          windBlowing={isLoading}
          branchesClosing={isLimited}
          rootsMoving={isSelected}
          color="#F0E6C8"
        />
      </div>

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full px-6 pb-24 pt-16">
        <AnimatePresence mode="wait">
          {/* ── IDLE: Question + Emotions ── */}
          {(isIdle || isSelected) && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              className="flex flex-col items-center w-full max-w-sm"
            >
              {/* Question on the trunk area */}
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: premium }}
                className="text-center font-display text-xl text-[#F0E6C8]/90 mb-16 leading-relaxed"
              >
                Cosa ti sta spezzando adesso?
              </motion.h1>

              {/* Emotion grid — positioned in root area */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="grid grid-cols-4 gap-x-4 gap-y-3 mb-8"
              >
                {PRESET_EMOTIONS.map((emotion, i) => {
                  const isThis = selectedEmotion === emotion;
                  const otherSelected =
                    selectedEmotion && !isThis && isSelected;
                  return (
                    <motion.button
                      key={emotion}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{
                        opacity: otherSelected ? 0 : 1,
                        y: 0,
                        scale: isThis && isSelected ? 1.1 : 1,
                      }}
                      transition={{
                        delay: 0.7 + i * 0.05,
                        duration: 0.5,
                        ease: premium,
                      }}
                      onClick={() => handlePresetClick(emotion)}
                      disabled={state !== "idle"}
                      className={`text-sm font-display tracking-wide transition-all duration-500 ${
                        isThis && isSelected
                          ? "text-[#F0E6C8] filo-selected-glow"
                          : "text-[#F0E6C8]/50 hover:text-[#F0E6C8]/80"
                      }`}
                    >
                      {emotion}
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Custom input */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isSelected ? 0 : 1,
                }}
                transition={{ delay: 1, duration: 0.6 }}
                className="w-full max-w-xs"
              >
                <div className="relative">
                  <input
                    type="text"
                    value={customEmotion}
                    onChange={(e) => setCustomEmotion(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="oppure scrivi..."
                    disabled={state !== "idle"}
                    className="w-full bg-transparent border-b border-[#F0E6C8]/20 focus:border-[#F0E6C8]/40 text-[#F0E6C8]/80 text-sm font-body text-center py-2 placeholder:text-[#F0E6C8]/20 focus:outline-none transition-colors"
                  />
                  {customEmotion.trim() && (
                    <button
                      onClick={handleCustomSubmit}
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[#F0E6C8]/40 hover:text-[#F0E6C8]/70 transition-colors text-xs font-ui"
                    >
                      →
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Session counter */}
              {sessionsToday > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                  className="text-[10px] text-[#F0E6C8]/20 font-ui mt-8"
                >
                  {sessionsToday}/3 oggi
                </motion.p>
              )}
            </motion.div>
          )}

          {/* ── LOADING: Wind animation ── */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0.3, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="text-[#F0E6C8]/40 text-sm font-display italic"
              >
                {selectedEmotion}
              </motion.p>
            </motion.div>
          )}

          {/* ── REVEALED: Three-part response ── */}
          {isRevealed && result && (
            <motion.div
              key="revealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center justify-between h-[70vh] max-h-[500px] w-full max-w-sm py-4"
            >
              {/* Branch text — top */}
              <div className="text-center px-4">
                <WordReveal
                  text={result.branchText}
                  delayStart={300}
                  onComplete={() => setRevealPhase(1)}
                  className="text-[#F0E6C8] text-lg font-display leading-relaxed"
                />
              </div>

              {/* Trunk text — middle */}
              <div className="text-center px-4">
                {revealPhase >= 1 && (
                  <WordReveal
                    text={result.trunkText}
                    delayStart={1000}
                    onComplete={() => setRevealPhase(2)}
                    className="text-[#F0E6C8]/70 text-base font-body italic leading-relaxed"
                  />
                )}
              </div>

              {/* Root text — bottom */}
              <div className="text-center px-4">
                {revealPhase >= 2 && (
                  <WordReveal
                    text={result.rootText}
                    delayStart={1000}
                    className="text-[#F0E6C8]/50 text-sm font-body leading-relaxed"
                  />
                )}
              </div>

              {/* Restart button — appears after full reveal */}
              {revealPhase >= 2 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3 }}
                  onClick={reset}
                  className="text-[10px] text-[#F0E6C8]/20 font-ui tracking-widest hover:text-[#F0E6C8]/40 transition-colors mt-4"
                >
                  ricomincia
                </motion.button>
              )}
            </motion.div>
          )}

          {/* ── LIMITED: Branches close ── */}
          {isLimited && (
            <motion.div
              key="limited"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center text-center px-8"
            >
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1, ease: premium }}
                className="text-[#F0E6C8]/60 text-base font-display italic leading-relaxed max-w-xs"
              >
                {limitMessage}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
