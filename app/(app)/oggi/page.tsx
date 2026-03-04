"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { LazyMarkdownText as MarkdownText } from "@/components/lazy-markdown";
import { FraseShareCard, TransitShareCard } from "@/components/share-card";
import { shareCardAsImage } from "@/lib/share";
import {
  Diamond, Sparkle, Moon, Share, Sun, ArrowUp, MoonStar,
} from "lucide-react";

const PushBanner = dynamic(() => import("@/components/push-banner").then(m => ({ default: m.PushBanner })), { ssr: false });

const premium = [0.16, 1, 0.3, 1] as const;

interface SkyData {
  respiro: string;
  sussurro: string;
  seme: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    cssVars: Record<string, string>;
  };
  sigilSvg: string;
  transits: Array<{
    transitPlanet: string;
    aspect: string;
    natalPlanet: string;
    description: string;
    weight: number;
  }>;
}

export default function OggiPage() {
  const [moment, setMoment] = useState<0 | 1 | 2>(0);
  const [sky, setSky] = useState<SkyData | null>(null);
  const [profile, setProfile] = useState<{
    sunSign?: string; moonSign?: string; risingSign?: string;
    awarenessScore?: number; strengths?: string[]; shadows?: string[];
  } | null>(null);
  const [userName, setUserName] = useState("");
  const [credits, setCredits] = useState<number | null>(null);
  const [streak, setStreak] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lunarRitual, setLunarRitual] = useState<{
    active: boolean;
    completed: boolean;
    ritualId?: string;
    phase?: string;
    sign?: string;
    aiMessage?: string;
    intention?: string;
  } | null>(null);
  const [ritualText, setRitualText] = useState("");
  const [ritualSaving, setRitualSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [sharingRitual, setSharingRitual] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const transitCardRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const handleShare = useCallback(async () => {
    if (!shareCardRef.current || sharing || !sky?.respiro) return;
    setSharing(true);
    try {
      await shareCardAsImage(shareCardRef.current, "unconsciousness-cielo.png", sky.theme.primary);
    } catch {
      // Share cancelled or failed silently
    } finally {
      setSharing(false);
    }
  }, [sharing, sky?.respiro, sky?.theme.primary]);

  const handleShareRitual = useCallback(async () => {
    if (!transitCardRef.current || sharingRitual) return;
    setSharingRitual(true);
    try {
      await shareCardAsImage(transitCardRef.current, "unconsciousness-luna.png");
    } catch {
      // cancelled
    } finally {
      setSharingRitual(false);
    }
  }, [sharingRitual]);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()).catch(() => ({})),
      fetch("/api/checkin").then((r) => r.json()).catch(() => ({ streak: 0, checkins: [] })),
      fetch("/api/sky/generate").then((r) => r.json()).catch(() => ({})),
    ]).then(([profileData, checkinData, skyData]) => {
      if (profileData.profile) setProfile(profileData.profile);
      if (profileData.user?.name) setUserName(profileData.user.name.split(" ")[0]);
      if (profileData.user?.credits !== undefined) setCredits(profileData.user.credits);
      if (profileData.isPremium) setIsPremium(true);
      if (checkinData.streak) setStreak(checkinData.streak);

      if (skyData.respiro) {
        setSky(skyData);
      }

      // Load lunar ritual (non-blocking)
      if (profileData.profile?.onboardingComplete) {
        fetch("/api/lunar-ritual")
          .then((r) => r.json())
          .then((d) => { if (d.active) setLunarRitual(d); })
          .catch(() => {});
      }

      setLoading(false);
    }).catch(() => { setLoading(false); });
  }, []);

  // Keep isPremium used
  void isPremium;

  const saveRitual = async () => {
    if (!ritualText.trim() || !lunarRitual?.ritualId || ritualSaving) return;
    setRitualSaving(true);
    try {
      await fetch("/api/lunar-ritual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ritualId: lunarRitual.ritualId, intention: ritualText }),
      });
      setLunarRitual({ ...lunarRitual, completed: true, intention: ritualText });
    } catch { /* */ } finally {
      setRitualSaving(false);
    }
  };

  // Swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && moment < 2) setMoment((m) => (m + 1) as 0 | 1 | 2);
      if (diff < 0 && moment > 0) setMoment((m) => (m - 1) as 0 | 1 | 2);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <Diamond size={36} className="text-amber ember-pulse mb-4" />
          <p className="text-text-muted text-sm font-ui">Allineo le stelle...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <Diamond size={36} className="text-amber ember-pulse mb-4" />
          <p className="text-text-muted text-sm font-ui">Preparo il tuo cielo...</p>
        </motion.div>
      </div>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });

  const cosmicSigns = [
    { sign: profile.sunSign, label: "Sole", Icon: Sun },
    { sign: profile.moonSign, label: "Luna", Icon: Moon },
    { sign: profile.risingSign, label: "Asc.", Icon: ArrowUp },
  ].filter((s) => s.sign);

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic background gradient from sky theme */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: sky?.theme
            ? `radial-gradient(ellipse at 50% 30%, ${sky.theme.primary.replace("hsl", "hsla").replace(")", ",0.08)")} 0%, transparent 60%),
               radial-gradient(ellipse at 70% 70%, ${sky.theme.secondary.replace("hsl", "hsla").replace(")", ",0.05)")} 0%, transparent 50%),
               var(--bg-base)`
            : "var(--bg-base)",
        }}
      />

      {/* Star dust overlay */}
      <div className="absolute inset-0 stars-bg opacity-40 pointer-events-none" />

      {/* Top bar — always visible */}
      <div className="absolute top-0 left-0 right-0 px-5 pt-5 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold font-display">
              {userName ? `${userName}` : "Il Cielo"}
            </h1>
            <p className="text-text-muted text-[11px] font-ui capitalize">{dateStr}</p>
          </div>
          <div className="flex items-center gap-2">
            {streak > 0 && (
              <span className="flex items-center gap-1 glass rounded-full px-2.5 py-1">
                <Diamond size={12} className="text-amber ember-pulse" />
                <span className="text-amber text-xs font-bold font-ui">{streak}</span>
              </span>
            )}
            {credits !== null && credits < 100 && (
              <span className="flex items-center gap-1 glass rounded-full px-2.5 py-1">
                <Sparkle size={12} className="text-verdigris" />
                <span className="text-verdigris text-xs font-bold font-ui">{credits}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3 Moments — AnimatePresence */}
      <AnimatePresence mode="wait">

        {/* ── IL RESPIRO ── */}
        {moment === 0 && (
          <motion.div
            key="respiro"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: premium }}
            className="min-h-screen flex flex-col items-center justify-between px-6 py-20 relative"
          >
            {/* Firma cosmica — 3 segni in alto */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8, ease: premium }}
              className="flex items-center gap-6"
            >
              {cosmicSigns.map(({ sign, label, Icon }) => (
                <div key={label} className="flex flex-col items-center gap-0.5">
                  <Icon size={11} className="text-amber/40" />
                  <span className="text-[9px] font-ui text-text-muted/40 tracking-wider uppercase">{label}</span>
                  <span className="text-[11px] font-ui text-text-muted/60">{sign}</span>
                </div>
              ))}
            </motion.div>

            {/* Sigil + Frase — centro assoluto */}
            <div className="flex flex-col items-center flex-1 justify-center">
              {/* Sigil piccolo e discreto */}
              {sky?.sigilSvg && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0.6, scale: 1 }}
                  transition={{ delay: 0.5, duration: 1, ease: premium }}
                  className="sigil-pulse mb-8"
                  style={{ width: 72, height: 72 }}
                  dangerouslySetInnerHTML={{ __html: sky.sigilSvg }}
                />
              )}

              {/* La Frase — protagonista assoluta */}
              <div className="text-center px-1 max-w-[90vw]">
                {sky?.respiro ? (
                  <p
                    className="font-display italic"
                    style={{
                      fontSize: "clamp(36px, 10vw, 64px)",
                      lineHeight: 1.12,
                      color: sky.theme.accent,
                    }}
                  >
                    {sky.respiro.split(" ").map((word, i) => (
                      <span
                        key={i}
                        className="word-reveal inline-block mr-[0.3em]"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      >
                        {word}
                      </span>
                    ))}
                  </p>
                ) : (
                  <div className="h-24 flex items-center justify-center">
                    <span className="filo-shimmer inline-block w-48 h-3 rounded-full bg-amber/10" />
                  </div>
                )}
              </div>
            </div>

            {/* Share button in basso */}
            {sky?.respiro && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                onClick={handleShare}
                disabled={sharing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber/20 text-amber/70 text-xs font-ui hover:border-amber/40 hover:text-amber transition-all disabled:opacity-40"
              >
                {sharing ? (
                  <span className="w-3.5 h-3.5 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
                ) : (
                  <Share size={14} />
                )}
                Condividi
              </motion.button>
            )}

            {/* Scroll hint */}
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-text-muted text-xs font-ui scroll-hint">Scorri →</p>
            </div>

            {/* Hidden share card */}
            {sky?.respiro && profile && (
              <div style={{ position: "absolute", left: -9999, top: 0 }}>
                <FraseShareCard
                  ref={shareCardRef}
                  frase={sky.respiro}
                  sunSign={profile.sunSign || ""}
                  moonSign={profile.moonSign || ""}
                  risingSign={profile.risingSign || ""}
                  date={dateStr}
                  themeAccent={sky.theme.accent}
                  themePrimary={sky.theme.primary}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* ── IL SUSSURRO ── */}
        {moment === 1 && (
          <motion.div
            key="sussurro"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: premium }}
            className="min-h-screen flex flex-col items-center justify-center px-8 py-20 relative"
          >
            {/* Sussurro text — linea per linea, font grande */}
            <div className="w-full max-w-sm">
              {sky?.sussurro ? (
                <div className="space-y-5">
                  {sky.sussurro.split("\n").filter(Boolean).map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.4, duration: 0.6, ease: premium }}
                      className="text-2xl font-body italic text-text-primary leading-relaxed"
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted font-body italic text-xl">Il cielo sussurra...</p>
              )}
            </div>

            {/* Transit pills */}
            {sky?.transits && sky.transits.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="flex flex-wrap justify-center gap-2 mt-10 max-w-md"
              >
                {sky.transits.slice(0, 4).map((t, i) => (
                  <span
                    key={i}
                    className="glass rounded-full px-3 py-1.5 text-[11px] font-ui text-text-secondary"
                  >
                    {t.description}
                  </span>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── IL SEME ── */}
        {moment === 2 && (
          <motion.div
            key="seme"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: premium }}
            className="min-h-screen px-4 pt-20 pb-32 overflow-y-auto relative"
          >
            <div className="max-w-2xl mx-auto">
              {/* Il Seme */}
              <div className="flex flex-col items-center justify-center min-h-[50vh] mb-8">
                <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-6">IL SEME DI OGGI</div>
                {sky?.seme ? (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: premium }}
                    className="text-headline text-center italic px-4"
                    style={{ color: sky.theme.accent }}
                  >
                    {sky.seme}
                  </motion.p>
                ) : (
                  <p className="text-text-muted font-body italic text-center">Il cielo prepara il tuo seme...</p>
                )}
              </div>

              {/* Lunar Ritual (conditional) */}
              {lunarRitual?.active && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ ease: premium }}
                  className={`glass rounded-2xl p-6 dimensional glow border mb-4 ${
                    lunarRitual.phase === "new_moon" ? "border-verdigris/15" : "border-amber-glow/15"
                  }`}
                >
                  <div className="text-[10px] font-ui tracking-[0.2em] mb-4 flex items-center gap-1" style={{ color: lunarRitual.phase === "new_moon" ? "var(--verdigris)" : "var(--amber-glow)" }}>
                    {lunarRitual.phase === "new_moon"
                      ? <><Sparkle size={10} className="inline" /> LUNA NUOVA IN {lunarRitual.sign?.toUpperCase()}</>
                      : <><MoonStar size={10} className="inline" /> LUNA PIENA IN {lunarRitual.sign?.toUpperCase()}</>}
                  </div>

                  {lunarRitual.completed ? (
                    <div>
                      <p className="text-text-secondary font-body italic text-sm mb-2 flex items-center gap-1">
                        Ritual completato <Sparkle size={10} className="inline" />
                      </p>
                      {lunarRitual.intention && (
                        <p className="text-text-primary font-body italic text-sm leading-relaxed mb-4">
                          &ldquo;{lunarRitual.intention}&rdquo;
                        </p>
                      )}
                      <button
                        onClick={handleShareRitual}
                        disabled={sharingRitual}
                        className="w-full py-2.5 rounded-xl text-sm font-ui flex items-center justify-center gap-2 border border-amber/20 text-amber/70 hover:border-amber/40 hover:text-amber transition-all disabled:opacity-40"
                      >
                        {sharingRitual ? (
                          <span className="w-3.5 h-3.5 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
                        ) : (
                          <Share size={14} />
                        )}
                        Condividi
                      </button>
                    </div>
                  ) : (
                    <div>
                      {lunarRitual.aiMessage && (
                        <MarkdownText
                          content={lunarRitual.aiMessage}
                          className="text-text-secondary font-body italic text-sm leading-relaxed mb-4"
                        />
                      )}
                      <textarea
                        value={ritualText}
                        onChange={(e) => setRitualText(e.target.value)}
                        placeholder={lunarRitual.phase === "new_moon"
                          ? "Scrivi la tua intenzione per questo ciclo..."
                          : "Cosa lasci andare?"}
                        rows={3}
                        className="w-full bg-bg-surface rounded-xl px-4 py-3 text-sm text-text-primary font-body italic placeholder:text-text-muted/60 resize-none focus:outline-none border border-border/50 focus:border-amber/30 transition-colors mb-3"
                      />
                      <button
                        onClick={saveRitual}
                        disabled={!ritualText.trim() || ritualSaving}
                        className={`w-full py-2.5 rounded-xl text-sm font-ui transition-all duration-300 ${
                          ritualText.trim() && !ritualSaving
                            ? lunarRitual.phase === "new_moon"
                              ? "bg-verdigris text-bg-base dimensional hover:glow"
                              : "bg-amber-glow text-bg-base dimensional hover:glow"
                            : "bg-bg-surface text-text-muted border border-border/50"
                        }`}
                      >
                        {ritualSaving
                          ? "..."
                          : lunarRitual.phase === "new_moon"
                          ? "Sigilla l'intenzione"
                          : "Rilascia"}
                      </button>
                    </div>
                  )}
                  {/* Hidden transit share card */}
                  <div style={{ position: "absolute", left: -9999, top: 0 }}>
                    <TransitShareCard
                      ref={transitCardRef}
                      eventName={lunarRitual.phase === "new_moon" ? "Luna Nuova" : "Luna Piena"}
                      eventSign={lunarRitual.sign || ""}
                      personalMeaning={lunarRitual.aiMessage || ""}
                      userSunSign={profile.sunSign || ""}
                    />
                  </div>
                </motion.div>
              )}

              {/* Push Banner */}
              <div className="mb-4">
                <PushBanner />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moment indicators — 3 dots */}
      <div className="fixed bottom-20 left-0 right-0 z-30 flex justify-center gap-3">
        {[0, 1, 2].map((m) => (
          <button
            key={m}
            onClick={() => setMoment(m as 0 | 1 | 2)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              moment === m
                ? "bg-amber scale-125 dot-active"
                : "bg-text-muted/30 hover:bg-text-muted/50"
            }`}
            aria-label={`Momento ${m + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
