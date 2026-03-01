"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
import { LazyMarkdownText as MarkdownText } from "@/components/lazy-markdown";
import { FraseShareCard, TransitShareCard } from "@/components/share-card";
import { shareCardAsImage } from "@/lib/share";
import {
  Circle, CircleDashed, CircleDot, Diamond, Sparkles, Sparkle,
  Sun, Moon, ArrowUp, Share, Eye, Compass, BookOpen,
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

export default function OggiPage() {
  const [frase, setFrase] = useState<string | null>(null);
  const [horoscope, setHoroscope] = useState("");
  const [horoscopeExpanded, setHoroscopeExpanded] = useState(false);
  const [cosmicEnergy, setCosmicEnergy] = useState<number | null>(null);
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
  const [horoscopeLoading, setHoroscopeLoading] = useState(true);
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

  const handleShare = useCallback(async () => {
    if (!shareCardRef.current || sharing || !frase) return;
    setSharing(true);
    try {
      await shareCardAsImage(shareCardRef.current, "unconsciousness-oggi.png");
    } catch {
      // Share cancelled or failed silently
    } finally {
      setSharing(false);
    }
  }, [sharing, frase]);

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
      fetch("/api/horoscope").then((r) => r.json()).catch(() => ({})),
      fetch("/api/oggi/frase").then((r) => r.json()).catch(() => ({ frase: null })),
    ]).then(([profileData, checkinData, horoscopeData, fraseData]) => {
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

      if (horoscopeData.horoscope) setHoroscope(horoscopeData.horoscope);
      else if (horoscopeData.needsUpgrade) setHoroscope("I tuoi crediti sono esauriti. Passa a Premium per l'oroscopo quotidiano.");
      if (horoscopeData.cosmicEnergy != null) setCosmicEnergy(horoscopeData.cosmicEnergy);

      if (fraseData.frase) setFrase(fraseData.frase);

      // Load lunar ritual (non-blocking)
      if (profileData.profile?.onboardingComplete) {
        fetch("/api/lunar-ritual")
          .then((r) => r.json())
          .then((d) => { if (d.active) setLunarRitual(d); })
          .catch(() => {});
      }

      setLoading(false);
      setHoroscopeLoading(false);
    }).catch(() => { setLoading(false); setHoroscopeLoading(false); });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Diamond size={36} className="text-amber ember-pulse mb-4" />
          <p className="text-text-muted text-sm font-ui">Allineo le stelle...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Diamond size={36} className="text-amber ember-pulse mb-4" />
          <p className="text-text-muted text-sm font-ui">Preparo il tuo cielo...</p>
        </motion.div>
      </div>
    );
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  const energyColor = cosmicEnergy != null
    ? cosmicEnergy >= 70 ? "text-amber" : cosmicEnergy >= 40 ? "text-verdigris" : "text-sienna"
    : "text-text-muted";

  // Truncate horoscope for collapsible
  const horoscopePreview = horoscope.length > 200 && !horoscopeExpanded
    ? horoscope.slice(0, 200) + "..."
    : horoscope;

  return (
    <div className="min-h-screen relative oggi-snap">
      {/* Card 1 — Hero: Frase Tagliente (postable) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ease: premium }}
        className="oggi-card min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden"
      >
        {/* Star field */}
        <div className="absolute inset-0 stars-bg opacity-50" />

        {/* Ambient glow behind phrase */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full blur-[100px] pointer-events-none" style={{ background: "radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%)" }} />

        {/* Top: name + date + badges */}
        <div className="absolute top-6 left-0 right-0 px-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold font-display">
                {userName ? `Ciao, ${userName}` : "Buongiorno"}
              </h1>
              <p className="text-text-muted text-xs font-ui capitalize">{dateStr}</p>
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

        {/* Center content — the postable zone */}
        <div className="relative z-10 text-center w-full max-w-lg">
          {/* Signs trio */}
          <div className="flex items-center justify-center gap-5 mb-10">
            <div className="text-center">
              <span className="text-text-muted/70 text-xs font-ui block mb-0.5"><Sun size={12} /></span>
              <span className="text-[13px] font-display text-amber font-semibold">{profile.sunSign}</span>
            </div>
            <Sparkle size={8} className="text-amber/25" />
            <div className="text-center">
              <span className="text-text-muted/70 text-xs font-ui block mb-0.5"><Moon size={12} /></span>
              <span className="text-[13px] font-display text-amber font-semibold">{profile.moonSign}</span>
            </div>
            <Sparkle size={8} className="text-amber/25" />
            <div className="text-center">
              <span className="text-text-muted/70 text-xs font-ui block mb-0.5"><ArrowUp size={12} /></span>
              <span className="text-[13px] font-display text-amber font-semibold">{profile.risingSign}</span>
            </div>
          </div>

          {/* Upper ornament */}
          <div className="text-sm mb-8">
            <Sparkle size={14} className="text-amber/30 ember-pulse" />
          </div>

          {/* The phrase */}
          <div className="px-2">
            {frase ? (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8, ease: premium }}
                className="text-display text-amber italic leading-tight"
              >
                {frase}
              </motion.p>
            ) : (
              <div className="text-display text-amber/20 italic">
                <span className="filo-shimmer inline-block w-full h-12 rounded-lg" />
              </div>
            )}
          </div>

          {/* Lower ornament */}
          <div className="text-sm mt-8">
            <Sparkle size={14} className="text-amber/30 ember-pulse" />
          </div>

          {/* Share button */}
          {frase && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
              onClick={handleShare}
              disabled={sharing}
              className="mt-8 flex items-center gap-2 px-5 py-2.5 rounded-full border border-amber/20 text-amber/70 text-xs font-ui hover:border-amber/40 hover:text-amber transition-all disabled:opacity-40"
            >
              {sharing ? (
                <span className="w-3.5 h-3.5 border-2 border-amber/30 border-t-amber rounded-full animate-spin" />
              ) : (
                <Share size={14} />
              )}
              Condividi nelle stories
            </motion.button>
          )}
        </div>

        {/* Bottom: branding + scroll hint */}
        <div className="absolute bottom-8 left-0 right-0 text-center z-10">
          <p className="text-[10px] text-amber/25 font-display tracking-[0.2em] mb-3">
            unconsciousness
          </p>
          <p className="text-text-muted text-xs font-ui scroll-hint">
            Scorri per il tuo cielo ↓
          </p>
        </div>

        {/* Hidden share card for rendering */}
        {frase && profile && (
          <div style={{ position: "absolute", left: -9999, top: 0 }}>
            <FraseShareCard
              ref={shareCardRef}
              frase={frase}
              sunSign={profile.sunSign || ""}
              moonSign={profile.moonSign || ""}
              risingSign={profile.risingSign || ""}
              date={dateStr}
            />
          </div>
        )}
      </motion.div>

      {/* Card 2 — Energia Cosmica */}
      {cosmicEnergy != null && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ ease: premium }}
          className="oggi-card min-h-[60vh] flex flex-col items-center justify-center px-6 py-12"
        >
          <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-6">ENERGIA COSMICA OGGI</div>
          <div className={`text-7xl font-bold font-display ${energyColor} mb-4`}>{cosmicEnergy}%</div>
          <div className="w-full max-w-xs h-2 bg-bg-surface rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${cosmicEnergy}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 1, ease: premium }}
              className={`h-full rounded-full ${
                cosmicEnergy >= 70 ? "bg-gradient-to-r from-amber-dim to-amber" :
                cosmicEnergy >= 40 ? "bg-gradient-to-r from-verdigris-dim to-verdigris" :
                "bg-gradient-to-r from-sienna-dim to-sienna"
              }`}
            />
          </div>
          <p className="text-text-secondary text-sm font-body italic text-center max-w-xs">
            {cosmicEnergy >= 70 ? "Giornata di forte allineamento. Segui i tuoi impulsi." :
             cosmicEnergy >= 40 ? "Transiti neutri. Buon momento per riflettere." :
             "Tensione nei transiti. Pratica pazienza e introspezione."}
          </p>
        </motion.div>
      )}

      {/* Card 3 — L'Oroscopo */}
      <div className="oggi-card px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: premium }}
            className={`glass rounded-2xl p-6 dimensional glow border border-amber/10 ${isPremium ? "premium-glow" : ""}`}
          >
            <div className="text-[10px] text-amber font-ui tracking-[0.2em] mb-4 flex items-center gap-1">
              <Diamond size={10} className="inline" /> IL TUO CIELO
            </div>
            {horoscopeLoading ? (
              <div className="flex items-center gap-3 py-4">
                <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-text-muted text-sm font-ui ml-2">Le stelle parlano...</span>
              </div>
            ) : horoscope ? (
              <div>
                <MarkdownText
                  content={horoscopePreview}
                  className="text-text-primary leading-relaxed italic text-lg font-body"
                />
                {horoscope.length > 200 && !horoscopeExpanded && (
                  <button
                    onClick={() => setHoroscopeExpanded(true)}
                    className="text-amber text-xs font-ui mt-3 transition-colors hover:text-amber-glow"
                  >
                    Continua a leggere ↓
                  </button>
                )}
              </div>
            ) : (
              <p className="text-text-muted font-body italic">L&apos;oracolo sta preparando il tuo messaggio...</p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Push notification banner */}
      <div className="px-4">
        <PushBanner />
      </div>

      {/* Card 4 — Lunar Ritual (conditional) */}
      {lunarRitual?.active && (
        <div className="oggi-card px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ease: premium }}
              className={`glass rounded-2xl p-6 dimensional glow border ${
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
                    Condividi nelle stories
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
          </div>
        </div>
      )}

      {/* Card 5 — Mood Check-in */}
      <div className="oggi-card px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ ease: premium }}
            className="glass rounded-2xl p-6 dimensional"
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
        </div>
      </div>

      {/* Card 6 — Per Te */}
      <div className="oggi-card px-4 py-8">
        <div className="max-w-2xl mx-auto">
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
            <Link href="/compatibilita" className="shrink-0 w-44">
              <div className="rounded-2xl p-5 border border-verdigris/10 bg-gradient-to-br from-verdigris/6 to-sienna/3 dimensional h-full group hover:glow transition-all">
                <Sparkle size={24} className="text-verdigris mb-3" />
                <div className="text-sm font-bold font-display mb-1">Compatibilit&agrave;</div>
                <div className="text-[10px] text-text-muted font-ui">Due anime, una danza</div>
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

      {/* Card 7 — Doni e Ombre */}
      <div className="oggi-card px-4 py-8 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-2xl p-5 dimensional">
              <div className="text-[10px] text-amber mb-3 font-ui tracking-[0.2em]">DONI COSMICI</div>
              <div className="space-y-2">
                {profile.strengths?.slice(0, 3).map((s, i) => (
                  <div key={i} className="text-sm text-text-secondary flex items-start gap-2 font-body">
                    <Diamond size={10} className="text-amber shrink-0" /><span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl p-5 dimensional">
              <div className="text-[10px] text-sienna mb-3 font-ui tracking-[0.2em]">OMBRE ATTIVE</div>
              <div className="space-y-2">
                {profile.shadows?.slice(0, 3).map((s, i) => (
                  <div key={i} className="text-sm text-text-secondary flex items-start gap-2 font-body">
                    <Eye size={10} className="text-sienna shrink-0" /><span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
