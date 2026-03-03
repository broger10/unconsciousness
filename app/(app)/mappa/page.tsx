"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, X, Sparkle } from "lucide-react";
import { PLANET_SYMBOLS } from "@/lib/astro-constants";

const premium = [0.16, 1, 0.3, 1] as const;

interface MapStarData {
  id: string;
  date: string;
  starX: number;
  starY: number;
  unlocked: boolean;
  unlockedAt: string | null;
  respiro: string;
  seme: string;
  dominantPlanet: string;
  dominantPlanetSign: string;
  transitDescription: string;
  themeColor: string;
  mood: number | null;
  brightness: number;
  specchioSlug: string | null;
}

interface ConstellationData {
  id: string;
  name: string;
  reading: string;
  dominantPlanet: string;
  starDates: string[];
  metadata: { centerX: number; centerY: number; cartografoAnalysis?: string } | null;
}

/* ─── Onboarding Overlay ─── */
function OnboardingOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center px-8 pointer-events-none"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-text-primary text-lg font-body italic text-center leading-relaxed mb-3"
          >
            Questo è il tuo cielo. Era già tutto qui.
            <br />
            Ogni giorno che torni, una stella si riconosce.
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-text-secondary text-sm font-body italic text-center"
          >
            Ogni giorno che apri Il Cielo, una stella si illumina.
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Star Component ─── */
function MapStar({
  star,
  isToday,
  isNewlyUnlocked,
  onTap,
  trembling,
}: {
  star: MapStarData;
  isToday: boolean;
  isNewlyUnlocked: boolean;
  onTap: () => void;
  trembling: boolean;
}) {
  const size = isToday ? 10 : 6;

  if (!star.unlocked) {
    return (
      <div
        className="absolute rounded-full star-dim"
        style={{
          left: `${star.starX}%`,
          top: `${star.starY}%`,
          width: size,
          height: size,
          backgroundColor: "rgba(240,230,200,0.5)",
          transform: "translate(-50%, -50%)",
        }}
      />
    );
  }

  return (
    <motion.button
      layoutId={`star-${star.id}`}
      onClick={onTap}
      className={`absolute rounded-full ${
        isNewlyUnlocked ? "star-bloom" : "star-breathe"
      } ${trembling ? "star-tremble" : ""}`}
      style={{
        left: `${star.starX}%`,
        top: `${star.starY}%`,
        width: size,
        height: size,
        backgroundColor: star.themeColor,
        "--star-color": star.themeColor,
        "--star-brightness": star.brightness,
        transform: "translate(-50%, -50%)",
        opacity: star.brightness,
        zIndex: isToday ? 20 : 10,
      } as React.CSSProperties}
      aria-label={`Stella del ${star.date}`}
    />
  );
}

/* ─── Star Detail ─── */
function StarDetail({
  star,
  onClose,
}: {
  star: MapStarData;
  onClose: () => void;
}) {
  const dateStr = new Date(star.date).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const planetSymbol = PLANET_SYMBOLS[star.dominantPlanet] || "☉";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <motion.div
        layoutId={`star-${star.id}`}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[90vw] max-w-md rounded-2xl glass dimensional overflow-hidden"
        transition={{ duration: 0.5, ease: premium }}
      >
        {/* Glow behind */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-[80px] pointer-events-none opacity-30"
          style={{ backgroundColor: star.themeColor }}
        />

        <div className="relative px-6 py-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-bg-glass transition-colors"
          >
            <X size={16} className="text-text-muted" />
          </button>

          {/* Date */}
          <div className="text-xs text-text-muted font-ui mb-4">{dateStr}</div>

          {/* Il Respiro */}
          <p className="text-text-primary text-xl font-display leading-relaxed mb-6">
            {star.respiro}
          </p>

          {/* Transit info */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl" style={{ color: star.themeColor }}>
              {planetSymbol}
            </span>
            <div>
              <div className="text-sm text-text-secondary font-body">
                {star.transitDescription}
              </div>
              <div className="text-xs text-text-muted font-ui">
                {star.dominantPlanet} in {star.dominantPlanetSign}
              </div>
            </div>
          </div>

          {/* Mood */}
          {star.mood && (
            <div className="text-xs text-text-muted font-ui mb-4">
              Mood: {"●".repeat(star.mood)}{"○".repeat(5 - star.mood)}
            </div>
          )}

          {/* Il Seme */}
          <div className="border-t border-border/20 pt-4 mt-4">
            <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-2">
              IL SEME
            </div>
            <p className="text-text-secondary text-sm font-body italic">
              {star.seme}
            </p>
          </div>

          {/* Specchio connection */}
          {star.specchioSlug && (
            <div className="border-t border-border/20 pt-3 mt-3">
              <div className="text-[10px] font-ui tracking-[0.2em] mb-1" style={{ color: star.themeColor }}>
                CONNESSIONE SPECCHIO
              </div>
              <p className="text-text-muted text-xs font-body">
                Capitolo: {star.specchioSlug}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Constellation Overlay ─── */
function ConstellationOverlay({
  constellation,
  stars,
  onTap,
}: {
  constellation: ConstellationData;
  stars: MapStarData[];
  onTap: () => void;
}) {
  const connectedStars = stars.filter((s) =>
    constellation.starDates.some((d) => d.split("T")[0] === s.date)
  );
  if (connectedStars.length < 2) return null;

  const sorted = [...connectedStars].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const pathD = sorted
    .map((s, i) => `${i === 0 ? "M" : "L"} ${s.starX} ${s.starY}`)
    .join(" ");

  const centerX = constellation.metadata?.centerX ?? avg(sorted.map((s) => s.starX));
  const centerY = constellation.metadata?.centerY ?? avg(sorted.map((s) => s.starY));

  return (
    <>
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d={pathD}
          fill="none"
          stroke="rgba(201,169,110,0.2)"
          strokeWidth="0.15"
          strokeLinecap="round"
          className="constellation-line"
        />
      </svg>
      <button
        onClick={onTap}
        className="absolute z-15 pointer-events-auto"
        style={{
          left: `${centerX}%`,
          top: `${Math.min(centerY + 5, 90)}%`,
          transform: "translateX(-50%)",
        }}
      >
        <span className="text-xs text-amber/50 font-display italic tracking-wide">
          {constellation.name}
        </span>
      </button>
    </>
  );
}

/* ─── Constellation Detail ─── */
function ConstellationDetail({
  constellation,
  onClose,
}: {
  constellation: ConstellationData;
  onClose: () => void;
}) {
  const planetSymbol = PLANET_SYMBOLS[constellation.dominantPlanet] || "☉";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.4, ease: premium }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[90vw] max-w-md rounded-2xl glass dimensional overflow-hidden"
      >
        <div className="px-6 py-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-bg-glass transition-colors"
          >
            <X size={16} className="text-text-muted" />
          </button>

          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl text-amber">{planetSymbol}</span>
            <div>
              <h2 className="text-xl font-display text-amber">
                {constellation.name}
              </h2>
              <p className="text-xs text-text-muted font-ui">
                {constellation.starDates.length} stelle · {constellation.dominantPlanet}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {constellation.reading.split("\n").map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.15 }}
                className="text-text-primary font-body text-base leading-relaxed italic"
              >
                {line}
              </motion.p>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function avg(nums: number[]): number {
  return nums.length === 0 ? 50 : nums.reduce((a, b) => a + b, 0) / nums.length;
}

/* ─── Empty State ─── */
function EmptySky() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: premium }}
        className="flex flex-col items-center"
      >
        <div className="relative mb-6">
          <Sparkle size={28} className="text-amber/50 ember-pulse" />
          <div className="absolute inset-0 w-28 h-28 -left-8 -top-8 rounded-full blur-[40px] bg-amber/5 pointer-events-none" />
        </div>
        <p className="text-text-secondary text-sm font-body italic text-center leading-relaxed mb-2">
          Il tuo cielo si sta formando.
        </p>
        <p className="text-text-muted text-xs font-body italic text-center leading-relaxed">
          Ogni giorno una nuova stella apparirà qui sopra,
          <br />
          tracciando la mappa della tua coscienza.
        </p>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Main Page
   ──────────────────────────────────────────────────────── */

export default function MappaPage() {
  const [stars, setStars] = useState<MapStarData[]>([]);
  const [constellations, setConstellations] = useState<ConstellationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [todayStarId, setTodayStarId] = useState<string | null>(null);
  const [selectedStar, setSelectedStar] = useState<MapStarData | null>(null);
  const [selectedConstellation, setSelectedConstellation] = useState<ConstellationData | null>(null);
  const [skyRevealed, setSkyRevealed] = useState(false);
  const [tremblingStars, setTremblingStars] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/mappa/daily")
      .then((r) => r.json())
      .then((d) => {
        setStars(d.stars ?? []);
        setConstellations(d.constellations ?? []);
        setShowOnboarding(d.showOnboarding ?? false);
        setTodayStarId(d.todayStarId ?? null);
        setLoading(false);

        // Sky reveal
        setTimeout(() => setSkyRevealed(true), 100);

        // Trigger tremble on nearby stars after today's bloom
        if (d.todayStarId) {
          const todayStar = (d.stars as MapStarData[])?.find((s) => s.id === d.todayStarId);
          if (todayStar) {
            setTimeout(() => {
              const nearby = (d.stars as MapStarData[])
                .filter(
                  (s) =>
                    s.id !== d.todayStarId &&
                    s.unlocked &&
                    Math.abs(s.starX - todayStar.starX) < 20 &&
                    Math.abs(s.starY - todayStar.starY) < 20
                )
                .map((s) => s.id);
              setTremblingStars(new Set(nearby));
              setTimeout(() => setTremblingStars(new Set()), 800);
            }, 2500);
          }
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const dismissOnboarding = useCallback(() => {
    fetch("/api/mappa/daily", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "onboardingShown" }),
    }).catch(() => {});
  }, []);

  // Auto-tighten view based on unlocked stars
  const viewBounds = useMemo(() => {
    const unlocked = stars.filter((s) => s.unlocked);
    if (unlocked.length < 3) {
      return { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    }
    const padding = 15;
    const xs = unlocked.map((s) => s.starX);
    const ys = unlocked.map((s) => s.starY);
    return {
      minX: Math.max(0, Math.min(...xs) - padding),
      maxX: Math.min(100, Math.max(...xs) + padding),
      minY: Math.max(0, Math.min(...ys) - padding),
      maxY: Math.min(100, Math.max(...ys) + padding),
    };
  }, [stars]);

  const mapToView = useCallback(
    (x: number, y: number) => {
      const rangeX = viewBounds.maxX - viewBounds.minX || 100;
      const rangeY = viewBounds.maxY - viewBounds.minY || 100;
      return {
        vx: ((x - viewBounds.minX) / rangeX) * 100,
        vy: ((y - viewBounds.minY) / rangeY) * 100,
      };
    },
    [viewBounds]
  );

  const unlockedCount = stars.filter((s) => s.unlocked).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center cielo-bg">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <Compass size={36} className="text-verdigris ember-pulse mb-4" />
          <p className="text-text-muted text-sm font-ui">Leggo le stelle...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cielo-bg relative overflow-hidden">
      {/* Dust particles */}
      <div className="absolute inset-0 cielo-dust pointer-events-none" />

      {/* Sky fade from black */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: skyRevealed ? 1 : 0 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="absolute inset-0"
      >
        {/* Header */}
        <div className="relative z-20 pt-6 pb-2 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold font-display">La Mappa</h1>
            {unlockedCount > 0 && (
              <span className="text-[11px] text-amber/60 font-ui">
                {unlockedCount} {unlockedCount === 1 ? "stella" : "stelle"}
              </span>
            )}
          </div>
        </div>

        {/* Star Field */}
        <div
          className="relative z-10 mx-2"
          style={{ height: "calc(100vh - 140px)" }}
        >
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse at 50% 45%, rgba(201,168,76,0.03) 0%, transparent 60%)",
            }}
          />
          {/* Horizon fade */}
          <div
            className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(10,26,15,0.8) 0%, transparent 100%)",
            }}
          />

          {stars.length === 0 ? (
            <EmptySky />
          ) : (
            <>
              {/* All stars */}
              {stars.map((star) => {
                const { vx, vy } = mapToView(star.starX, star.starY);
                const isToday = star.id === todayStarId;
                const isNewlyUnlocked =
                  isToday &&
                  !!star.unlockedAt &&
                  Date.now() - new Date(star.unlockedAt).getTime() < 10000;

                return (
                  <MapStar
                    key={star.id}
                    star={{ ...star, starX: vx, starY: vy }}
                    isToday={isToday}
                    isNewlyUnlocked={isNewlyUnlocked}
                    onTap={() => star.unlocked && setSelectedStar(star)}
                    trembling={tremblingStars.has(star.id)}
                  />
                );
              })}

              {/* Constellation lines */}
              {constellations.map((c) => (
                <ConstellationOverlay
                  key={c.id}
                  constellation={c}
                  stars={stars.map((s) => {
                    const { vx, vy } = mapToView(s.starX, s.starY);
                    return { ...s, starX: vx, starY: vy };
                  })}
                  onTap={() => setSelectedConstellation(c)}
                />
              ))}

              {/* Today's star label */}
              {todayStarId && (() => {
                const today = stars.find((s) => s.id === todayStarId);
                if (!today) return null;
                const { vx, vy } = mapToView(today.starX, today.starY);
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 3, duration: 0.8 }}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${vx}%`,
                      top: `${vy + 4}%`,
                      transform: "translateX(-50%)",
                    }}
                  >
                    <span className="text-[11px] font-display italic tracking-wider text-amber star-glow-text">
                      oggi
                    </span>
                  </motion.div>
                );
              })()}
            </>
          )}
        </div>
      </motion.div>

      {/* Onboarding overlay */}
      {showOnboarding && <OnboardingOverlay onDismiss={dismissOnboarding} />}

      {/* Star detail modal */}
      <AnimatePresence>
        {selectedStar && (
          <StarDetail star={selectedStar} onClose={() => setSelectedStar(null)} />
        )}
      </AnimatePresence>

      {/* Constellation detail modal */}
      <AnimatePresence>
        {selectedConstellation && (
          <ConstellationDetail
            constellation={selectedConstellation}
            onClose={() => setSelectedConstellation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
