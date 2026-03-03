"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LazyMarkdownText as MarkdownText } from "@/components/lazy-markdown";
import { FraseShareCard, TransitShareCard } from "@/components/share-card";
import { shareCardAsImage } from "@/lib/share";
import {
  Circle, CircleDashed, CircleDot, Diamond, Sparkles, Sparkle,
  Moon, Share, Eye, Compass, BookOpen,
  type LucideIcon,
} from "lucide-react";

const PushBanner = dynamic(() => import("@/components/push-banner").then(m => ({ default: m.PushBanner })), { ssr: false });

const premium = [0.16, 1, 0.3, 1] as const;

const moodIcons: { v: number; Icon: LucideIcon; l: string }[] = [
  { v: 1, Icon: Circle, l: "Pesante" },
  { v: 2, Icon: CircleDashed, l: "Bassa" },
  { v: 3, Icon: CircleDot, l: "Neutra" },
  { v: 4, Icon: Diamond, l: "Buona" },
  { v: 5, Icon: Sparkles, l: "Radiante" },
];

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
  const [todayMood, setTodayMood] = useState(0);
  const [moodSaved, setMoodSaved] = useState(false);
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
      await shareCardAsImage(shareCardRef.current, "unconsciousness-cielo.png");
    } catch {
      // Share cancelled or failed silently
    } finally {
      setSharing(false);
    }
  }, [sharing, sky?.respiro]);

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

      if (checkinData.checkins?.length > 0) {
        const lastCheckin = new Date(checkinData.checkins[0].createdAt);
        const today = new Date();
        if (lastCheckin.toDateString() === today.toDateString()) {
          setTodayMood(checkinData.checkins[0].mood);
          setMoodSaved(true);
        }
      }

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

  const saveMood = async (mood: number) => {
    setTodayMood(mood);
    setMoodSaved(true);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, energy: mood }),
      });
      if (res.ok) {
        setStreak((s) => s + 1);
        if (credits !== null && !isPremium) setCredits((c) => c !== null ? Math.max(0, c - 2) : c);
      }
    } catch {
      // Check-in already saved optimistically
    }
  };

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
        {moment === 0 && (
          <motion.div
            key="respiro"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: premium }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative"
          >
            {/* Sigil */}
            {sky?.sigilSvg && (
              <div
                className="sigil-pulse mb-8"
                style={{ width: 120, height: 120 }}
                dangerouslySetInnerHTML={{ __html: sky.sigilSvg }}
              />
            )}

            {/* The Respiro — word by word */}
            <div className="text-center max-w-lg px-2">
              {sky?.respiro ? (
                <p className="text-display italic leading-tight" style={{ color: sky.theme.accent }}>
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
                <div className="text-display text-amber/20 italic">
                  <span className="filo-shimmer inline-block w-full h-12 rounded-lg" />
                </div>
              )}
            </div>

            {/* Share button */}
            {sky?.respiro && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                onClick={handleShare}
                disabled={sharing}
                className="mt-10 flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber/20 text-amber/70 text-xs font-ui hover:border-amber/40 hover:text-amber transition-all disabled:opacity-40"
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
              <p className="text-text-muted text-xs font-ui scroll-hint">
                Scorri →
              </p>
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
                />
              </div>
            )}
          </motion.div>
        )}

        {moment === 1 && (
          <motion.div
            key="sussurro"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: premium }}
            className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative"
          >
            {/* Sussurro text — line by line */}
            <div className="text-center max-w-md">
              {sky?.sussurro ? (
                <div className="space-y-3">
                  {sky.sussurro.split("\n").filter(Boolean).map((line, i) => (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.4, duration: 0.6, ease: premium }}
                      className="text-lg font-body italic text-text-primary leading-relaxed"
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted font-body italic">Il cielo sussurra...</p>
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

        {moment === 2 && (
          <motion.div
            key="seme"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: premium }}
            className="min-h-screen px-4 pt-20 pb-32 overflow-y-auto relative"
          >
            {/* Il Seme */}
            <div className="max-w-2xl mx-auto">
              <div className="flex flex-col items-center justify-center min-h-[40vh] mb-8">
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

              {/* Mood Check-in */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ ease: premium }}
                className="glass rounded-2xl p-6 dimensional mb-4"
              >
                <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-4 flex items-center gap-1">
                  {moodSaved ? <><Diamond size={10} className="inline" /> REGISTRATO OGGI</> : "COME TI SENTI OGGI?"}
                </div>
                <div className="flex justify-between gap-2">
                  {moodIcons.map((m) => (
                    <button
                      key={m.v}
                      onClick={() => !moodSaved && saveMood(m.v)}
                      disabled={moodSaved}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 flex-1 ${
                        todayMood === m.v
                          ? "glass glow text-amber scale-105"
                          : moodSaved
                          ? "opacity-30"
                          : "hover:bg-bg-glass text-text-muted hover:text-amber"
                      }`}
                    >
                      <m.Icon size={24} />
                      <span className="text-[10px] font-ui">{m.l}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

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
                      : <><Moon size={10} className="inline" /> LUNA PIENA IN {lunarRitual.sign?.toUpperCase()}</>}
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

              {/* Per Te — quick links */}
              <div className="mb-8">
                <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-3 px-1">PER TE</div>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
                  <Link href="/chiedi" className="shrink-0 w-44">
                    <div className="rounded-2xl p-5 border border-amber/10 bg-gradient-to-br from-amber/6 to-verdigris/3 dimensional h-full group hover:glow transition-all">
                      <Sparkles size={24} className="text-amber mb-3" />
                      <div className="text-sm font-bold font-display mb-1">Chiedi all&apos;oracolo</div>
                      <div className="text-[10px] text-text-muted font-ui">Ogni domanda apre una porta</div>
                    </div>
                  </Link>
                  <Link href="/visions" className="shrink-0 w-44">
                    <div className="rounded-2xl p-5 border border-verdigris/10 bg-gradient-to-br from-verdigris/6 to-amber/3 dimensional h-full group hover:glow transition-all">
                      <Compass size={24} className="text-verdigris mb-3" />
                      <div className="text-sm font-bold font-display mb-1">Tre Destini</div>
                      <div className="text-[10px] text-text-muted font-ui">Il tuo futuro, triplicato</div>
                    </div>
                  </Link>
                  <Link href="/mappa" className="shrink-0 w-44">
                    <div className="rounded-2xl p-5 border border-sienna/10 bg-gradient-to-br from-sienna/6 to-amber/3 dimensional h-full group hover:glow transition-all">
                      <Eye size={24} className="text-sienna mb-3" />
                      <div className="text-sm font-bold font-display mb-1">Le tue ombre</div>
                      <div className="text-[10px] text-text-muted font-ui">Ci&ograve; che non vedi</div>
                    </div>
                  </Link>
                  <Link href="/diario" className="shrink-0 w-44">
                    <div className="rounded-2xl p-5 border border-amber-glow/10 bg-gradient-to-br from-amber-glow/5 to-amber/3 dimensional h-full group hover:glow transition-all">
                      <BookOpen size={24} className="text-amber-glow mb-3" />
                      <div className="text-sm font-bold font-display mb-1">Diario cosmico</div>
                      <div className="text-[10px] text-text-muted font-ui">Scrivi e rifletti</div>
                    </div>
                  </Link>
                </div>
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
