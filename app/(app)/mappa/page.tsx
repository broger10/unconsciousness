"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass, Sun, Moon, Eye, Sparkle, TrendingUp,
  MoonStar, ChevronLeft, ChevronRight, X,
} from "lucide-react";

const premium = [0.16, 1, 0.3, 1] as const;

interface MapInsightData {
  id: string;
  date: string;
  type: "star" | "constellation";
  content: string;
  category: string;
  metadata: {
    x?: number;
    y?: number;
    brightness?: number;
    name?: string;
    starIds?: string[];
  } | null;
  read: boolean;
}

const categoryConfig: Record<string, { icon: typeof Sun; color: string; label: string; hex: string }> = {
  transit: { icon: Sun, color: "text-amber", label: "Transito", hex: "#C9A84C" },
  shadow: { icon: Eye, color: "text-sienna", label: "Ombra", hex: "#C4614A" },
  mirror: { icon: MoonStar, color: "text-text-secondary", label: "Specchio", hex: "#8BAF8D" },
  growth: { icon: TrendingUp, color: "text-verdigris", label: "Crescita", hex: "#4A9B8E" },
  lunar: { icon: Moon, color: "text-text-primary", label: "Lunare", hex: "#F0E6C8" },
};

/* ─── Moon Phase SVG ─── */
function MoonPhaseIcon({ className }: { className?: string }) {
  const now = new Date();
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
  );
  // Approximate lunar cycle: 29.53 days
  const phase = ((dayOfYear % 29.53) / 29.53) * 100;

  // phase 0-100: 0=new, 25=first quarter, 50=full, 75=last quarter
  const illumination = phase <= 50 ? phase / 50 : (100 - phase) / 50;
  const isWaxing = phase <= 50;

  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className={className}>
      <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(240,230,200,0.15)" strokeWidth="0.5" />
      <circle cx="16" cy="16" r="14" fill="rgba(240,230,200,0.03)" />
      {/* Illuminated portion */}
      <clipPath id="moonClip">
        <circle cx="16" cy="16" r="14" />
      </clipPath>
      <ellipse
        cx={isWaxing ? 16 + (1 - illumination) * 14 : 16 - (1 - illumination) * 14}
        cy="16"
        rx={14 * illumination}
        ry="14"
        fill="rgba(240,230,200,0.25)"
        clipPath="url(#moonClip)"
      />
    </svg>
  );
}

/* ─── Star component ─── */
function Star({
  star,
  isToday,
  onClick,
}: {
  star: MapInsightData;
  isToday: boolean;
  onClick: () => void;
}) {
  const config = categoryConfig[star.category] || categoryConfig.mirror;
  const x = star.metadata?.x ?? 50;
  const y = star.metadata?.y ?? 50;
  const brightness = star.metadata?.brightness ?? 0.7;
  const size = isToday ? 14 : star.category === "lunar" ? 10 : 7;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: brightness }}
      transition={{ duration: 0.6, ease: premium, delay: isToday ? 0.3 : Math.random() * 0.5 }}
      onClick={onClick}
      className={`absolute rounded-full ${isToday ? "star-today" : "star-glow"} ${!star.read && !isToday ? "ring-1 ring-amber/30" : ""}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        backgroundColor: config.hex,
        color: config.hex,
        transform: "translate(-50%, -50%)",
        zIndex: isToday ? 20 : 10,
      }}
      aria-label={`Stella: ${star.category}`}
    />
  );
}

/* ─── Constellation lines ─── */
function ConstellationLines({
  stars,
  constellation,
}: {
  stars: MapInsightData[];
  constellation: MapInsightData;
}) {
  const starIds = (constellation.metadata?.starIds || []) as string[];
  const connectedStars = stars.filter((s) => starIds.includes(s.id));
  if (connectedStars.length < 2) return null;

  const points = connectedStars.map((s) => ({
    x: s.metadata?.x ?? 50,
    y: s.metadata?.y ?? 50,
  }));

  // Build path through all points
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.path
        d={pathD}
        fill="none"
        stroke="rgba(201,169,110,0.2)"
        strokeWidth="0.18"
        strokeLinecap="round"
        strokeDasharray="0.8 0.4"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.5, ease: premium }}
      />
    </svg>
  );
}

/* ─── Star Detail Sheet ─── */
function StarDetail({
  star,
  onClose,
  onMarkRead,
}: {
  star: MapInsightData;
  onClose: () => void;
  onMarkRead: (id: string) => void;
}) {
  const config = categoryConfig[star.category] || categoryConfig.mirror;
  const Icon = config.icon;
  const date = new Date(star.date);
  const dateStr = date.toLocaleDateString("it-IT", { day: "numeric", month: "long" });
  const isConstellation = star.type === "constellation";

  useEffect(() => {
    if (!star.read) {
      onMarkRead(star.id);
    }
  }, [star.id, star.read, onMarkRead]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.4, ease: premium }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg mx-4 mb-[max(1rem,env(safe-area-inset-bottom))] rounded-2xl glass dimensional overflow-hidden"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-8 h-1 rounded-full bg-text-muted/30" />
        </div>

        <div className="px-6 pb-6 pt-2 relative">
          {/* Subtle glow behind content */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none opacity-30" style={{ backgroundColor: config.hex }} />

          {/* Header */}
          <div className="relative flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${config.hex}15`, boxShadow: `0 0 12px ${config.hex}20` }}
              >
                <Icon size={16} style={{ color: config.hex }} />
              </div>
              <div>
                <div className={`text-xs font-display tracking-wide ${config.color}`}>
                  {isConstellation ? (star.metadata?.name as string) || "Costellazione" : config.label.toUpperCase()}
                </div>
                <div className="text-[11px] text-text-muted font-body">{dateStr}</div>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg-glass transition-colors">
              <X size={16} className="text-text-muted" />
            </button>
          </div>

          {/* Content */}
          <p className="relative text-text-primary font-body text-lg leading-relaxed italic">
            {isConstellation ? `\u201C${star.content}\u201D` : star.content}
          </p>

          {isConstellation && (
            <div className="mt-5 pt-3 border-t border-border/20">
              <div className="text-[11px] text-text-secondary font-ui tracking-wide flex items-center gap-1.5">
                <Sparkle size={10} style={{ color: config.hex }} />
                COSTELLAZIONE SETTIMANALE
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Week Selector ─── */
function WeekSelector({
  weekOffset,
  onPrev,
  onNext,
}: {
  weekOffset: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekOffset * 7 - today.getDay() + 1);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const fmt = (d: Date) => d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={onPrev}
        className="p-1.5 rounded-lg hover:bg-bg-glass transition-colors"
        aria-label="Settimana precedente"
      >
        <ChevronLeft size={14} className="text-text-muted" />
      </button>
      <span className="text-xs text-text-secondary font-ui tracking-wide min-w-[120px] text-center">
        {weekOffset === 0 ? "Questa settimana" : `${fmt(weekStart)} – ${fmt(weekEnd)}`}
      </span>
      <button
        onClick={onNext}
        disabled={weekOffset === 0}
        className="p-1.5 rounded-lg hover:bg-bg-glass transition-colors disabled:opacity-20"
        aria-label="Settimana successiva"
      >
        <ChevronRight size={14} className="text-text-muted" />
      </button>
    </div>
  );
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
          Ogni giorno una nuova stella apparir&agrave; qui sopra,<br />
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
  const [stars, setStars] = useState<MapInsightData[]>([]);
  const [constellations, setConstellations] = useState<MapInsightData[]>([]);
  const [todayStar, setTodayStar] = useState<MapInsightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStar, setSelectedStar] = useState<MapInsightData | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    fetch("/api/mappa/daily")
      .then((r) => r.json())
      .then((d) => {
        if (d.today) setTodayStar(d.today);
        if (d.stars) setStars(d.stars);
        if (d.constellations) setConstellations(d.constellations);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const markRead = useCallback((id: string) => {
    fetch("/api/mappa/daily", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ insightId: id }),
    }).catch(() => {});

    setStars((prev) => prev.map((s) => (s.id === id ? { ...s, read: true } : s)));
    if (todayStar?.id === id) setTodayStar((prev) => prev ? { ...prev, read: true } : prev);
  }, [todayStar?.id]);

  // Filter stars by selected week
  const filteredStars = stars.filter((s) => {
    const starDate = new Date(s.date);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekOffset * 7 - today.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return starDate >= weekStart && starDate < weekEnd;
  });

  const weekConstellations = constellations.filter((c) => {
    const cDate = new Date(c.date);
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekOffset * 7 - today.getDay() + 1);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return cDate >= weekStart && cDate < weekEnd;
  });

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

  const todayDate = new Date().toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen cielo-bg relative overflow-hidden">
      {/* Dust particles overlay */}
      <div className="absolute inset-0 cielo-dust pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ease: premium }}
        className="relative z-20 pt-6 pb-2 px-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold font-display">Il Cielo Interiore</h1>
            <p className="text-xs text-text-secondary font-body italic">{todayDate}</p>
          </div>
          <div className="flex items-center gap-3">
            {stars.length > 0 && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[11px] text-amber/60 font-ui"
              >
                {stars.length} {stars.length === 1 ? "stella" : "stelle"}
              </motion.span>
            )}
            <MoonPhaseIcon />
          </div>
        </div>
      </motion.div>

      {/* Week Selector */}
      <div className="relative z-20 px-4 py-2">
        <WeekSelector
          weekOffset={weekOffset}
          onPrev={() => setWeekOffset((o) => Math.min(o + 1, 3))}
          onNext={() => setWeekOffset((o) => Math.max(o - 1, 0))}
        />
      </div>

      {/* Star Field */}
      <div className="relative z-10 mx-4" style={{ height: "calc(100vh - 200px)" }}>
        {/* Ambient center glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at 50% 45%, rgba(201,168,76,0.04) 0%, transparent 60%)",
        }} />
        {/* Horizon fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{
          background: "linear-gradient(to top, rgba(10,26,15,0.8) 0%, transparent 100%)",
        }} />

        {filteredStars.length === 0 && weekOffset > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-text-secondary text-sm font-body italic">Nessuna stella in questa settimana.</p>
          </div>
        ) : filteredStars.length === 0 ? (
          <EmptySky />
        ) : (
          <>
            {/* Constellation lines */}
            {weekConstellations.map((c) => (
              <ConstellationLines
                key={c.id}
                stars={filteredStars}
                constellation={c}
              />
            ))}

            {/* Stars */}
            {filteredStars.map((star) => (
              <Star
                key={star.id}
                star={star}
                isToday={weekOffset === 0 && todayStar?.id === star.id}
                onClick={() => setSelectedStar(star)}
              />
            ))}
          </>
        )}

        {/* Constellation name overlay */}
        {weekConstellations.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-24 left-0 right-0 text-center pointer-events-none"
          >
            {weekConstellations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedStar(c)}
                className="pointer-events-auto"
              >
                <span className="text-sm text-amber/60 font-display italic tracking-wide">
                  {(c.metadata?.name as string) || "Costellazione"}
                </span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Today's star label */}
        {weekOffset === 0 && todayStar && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute pointer-events-none"
            style={{
              left: `${todayStar.metadata?.x ?? 50}%`,
              top: `${(todayStar.metadata?.y ?? 50) + 4}%`,
              transform: "translateX(-50%)",
            }}
          >
            <span className={`text-[11px] font-display italic tracking-wider ${!todayStar.read ? "text-amber star-glow-text" : "text-text-secondary"}`}>
              {!todayStar.read ? "nuova stella" : "oggi"}
            </span>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-20 px-6 pb-20 flex justify-center gap-5 flex-wrap"
      >
        {Object.entries(categoryConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cfg.hex, boxShadow: `0 0 6px ${cfg.hex}60` }}
            />
            <span className="text-[11px] text-text-secondary font-ui">{cfg.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Star Detail Modal */}
      <AnimatePresence>
        {selectedStar && (
          <StarDetail
            star={selectedStar}
            onClose={() => setSelectedStar(null)}
            onMarkRead={markRead}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
