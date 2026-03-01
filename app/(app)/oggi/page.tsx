"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const premium = [0.16, 1, 0.3, 1] as const;

const moodSymbols = [
  { v: 1, s: "&#9676;", l: "Pesante" },
  { v: 2, s: "&#9681;", l: "Bassa" },
  { v: 3, s: "&#9672;", l: "Neutra" },
  { v: 4, s: "&#9670;", l: "Buona" },
  { v: 5, s: "&#10038;", l: "Radiante" },
];

export default function OggiPage() {
  const [horoscope, setHoroscope] = useState("");
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
  const [loading, setLoading] = useState(true);
  const [horoscopeLoading, setHoroscopeLoading] = useState(true);

  useEffect(() => {
    // All 3 API calls in parallel — no waterfall
    Promise.all([
      fetch("/api/profile").then((r) => r.json()).catch(() => ({})),
      fetch("/api/checkin").then((r) => r.json()).catch(() => ({ streak: 0, checkins: [] })),
      fetch("/api/horoscope").then((r) => r.json()).catch(() => ({})),
    ]).then(([profileData, checkinData, horoscopeData]) => {
      if (profileData.profile) setProfile(profileData.profile);
      if (profileData.user?.name) setUserName(profileData.user.name.split(" ")[0]);
      if (profileData.user?.credits !== undefined) setCredits(profileData.user.credits);
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
        if (credits !== null) setCredits((c) => c !== null ? Math.max(0, c - 2) : c);
      }
    } catch {
      // Check-in already saved optimistically
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-4xl text-amber ember-pulse mb-4">&#9670;</div>
          <p className="text-text-muted text-sm font-ui">Allineo le stelle...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-4xl text-amber ember-pulse mb-4">&#9670;</div>
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

  return (
    <div className="min-h-screen relative">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: premium }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold font-display">
              {userName ? `Ciao, ${userName}` : "Buongiorno"}
            </h1>
            <div className="flex items-center gap-2">
              {cosmicEnergy != null && (
                <span className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
                  <span className={`text-xs ${energyColor}`}>&#9670;</span>
                  <span className={`text-xs font-bold font-ui ${energyColor}`}>{cosmicEnergy}</span>
                </span>
              )}
              {credits !== null && credits < 100 && (
                <span className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
                  <span className="text-verdigris text-xs">&#10038;</span>
                  <span className="text-verdigris text-xs font-bold font-ui">{credits}</span>
                </span>
              )}
              {streak > 0 && (
                <span className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5">
                  <span className="text-amber text-xs ember-pulse">&#9670;</span>
                  <span className="text-amber text-xs font-bold font-ui">{streak}</span>
                </span>
              )}
            </div>
          </div>
          <p className="text-text-muted text-sm font-ui capitalize">{dateStr}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-text-muted font-ui">
            <span>&#9788; {profile.sunSign}</span>
            <span className="text-border-light">&#183;</span>
            <span>&#9790; {profile.moonSign}</span>
            <span className="text-border-light">&#183;</span>
            <span>&#8593; {profile.risingSign}</span>
          </div>
        </motion.div>

        {/* Energia cosmica del giorno */}
        {cosmicEnergy != null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, ease: premium }}
            className="glass rounded-2xl p-5 mb-5 dimensional"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] text-text-muted font-ui tracking-[0.2em]">ENERGIA COSMICA</div>
              <span className={`text-lg font-bold font-display ${energyColor}`}>{cosmicEnergy}%</span>
            </div>
            <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${cosmicEnergy}%` }}
                transition={{ delay: 0.3, duration: 1, ease: premium }}
                className={`h-full rounded-full ${
                  cosmicEnergy >= 70 ? "bg-gradient-to-r from-amber-dim to-amber" :
                  cosmicEnergy >= 40 ? "bg-gradient-to-r from-verdigris-dim to-verdigris" :
                  "bg-gradient-to-r from-sienna-dim to-sienna"
                }`}
              />
            </div>
            <p className="text-[10px] text-text-muted font-ui mt-2">
              {cosmicEnergy >= 70 ? "Giornata di forte allineamento. Segui i tuoi impulsi." :
               cosmicEnergy >= 40 ? "Transiti neutri. Buon momento per riflettere." :
               "Tensione nei transiti. Pratica pazienza e introspezione."}
            </p>
          </motion.div>
        )}

        {/* Oroscopo del giorno */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: premium }}
          className="glass rounded-2xl p-6 mb-5 dimensional glow border border-amber/10"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-amber font-ui tracking-[0.2em]">&#9670; IL TUO OROSCOPO DI OGGI</div>
          </div>
          {horoscopeLoading ? (
            <div className="flex items-center gap-3 py-4">
              <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-text-muted text-sm font-ui ml-2">Le stelle parlano...</span>
            </div>
          ) : horoscope ? (
            <p className="text-text-primary leading-relaxed italic text-lg font-body">&ldquo;{horoscope}&rdquo;</p>
          ) : (
            <p className="text-text-muted font-body italic">L&apos;oracolo sta preparando il tuo messaggio...</p>
          )}
        </motion.div>

        {/* Mood check-in rapido */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: premium }}
          className="glass rounded-2xl p-5 mb-5 dimensional"
        >
          <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-3">
            {moodSaved ? "&#9670; REGISTRATO OGGI" : "COME TI SENTI OGGI?"}
          </div>
          <div className="flex justify-between gap-2">
            {moodSymbols.map((m) => (
              <button
                key={m.v}
                onClick={() => !moodSaved && saveMood(m.v)}
                disabled={moodSaved}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-300 flex-1 ${
                  todayMood === m.v
                    ? "glass glow text-amber scale-105"
                    : moodSaved
                    ? "opacity-30"
                    : "hover:bg-bg-glass text-text-muted hover:text-amber"
                }`}
              >
                <span className="text-2xl" dangerouslySetInnerHTML={{ __html: m.s }} />
                <span className="text-[10px] font-ui">{m.l}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Per te — card orizzontali */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: premium }}
          className="mb-5"
        >
          <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-3 px-1">PER TE</div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            <Link href="/chiedi" className="shrink-0 w-44">
              <div className="rounded-2xl p-5 border border-amber/10 bg-gradient-to-br from-amber/6 to-verdigris/3 dimensional h-full group hover:glow transition-all">
                <div className="text-2xl text-amber mb-3">&#10038;</div>
                <div className="text-sm font-bold font-display mb-1">Chiedi all&apos;oracolo</div>
                <div className="text-[10px] text-text-muted font-ui">Ogni domanda apre una porta</div>
              </div>
            </Link>
            <Link href="/visions" className="shrink-0 w-44">
              <div className="rounded-2xl p-5 border border-verdigris/10 bg-gradient-to-br from-verdigris/6 to-amber/3 dimensional h-full group hover:glow transition-all">
                <div className="text-2xl text-verdigris mb-3">&#9672;</div>
                <div className="text-sm font-bold font-display mb-1">Tre Visioni</div>
                <div className="text-[10px] text-text-muted font-ui">Il tuo futuro, triplicato</div>
              </div>
            </Link>
            <Link href="/mappa" className="shrink-0 w-44">
              <div className="rounded-2xl p-5 border border-sienna/10 bg-gradient-to-br from-sienna/6 to-amber/3 dimensional h-full group hover:glow transition-all">
                <div className="text-2xl text-sienna mb-3">&#9681;</div>
                <div className="text-sm font-bold font-display mb-1">Le tue ombre</div>
                <div className="text-[10px] text-text-muted font-ui">Ci&ograve; che non vedi</div>
              </div>
            </Link>
            <Link href="/diario" className="shrink-0 w-44">
              <div className="rounded-2xl p-5 border border-amber-glow/10 bg-gradient-to-br from-amber-glow/5 to-amber/3 dimensional h-full group hover:glow transition-all">
                <div className="text-2xl text-amber-glow mb-3">&#9790;</div>
                <div className="text-sm font-bold font-display mb-1">Diario cosmico</div>
                <div className="text-[10px] text-text-muted font-ui">Scrivi e rifletti</div>
              </div>
            </Link>
          </div>
        </motion.div>

        {/* Doni e ombre */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ease: premium }}
          className="grid grid-cols-2 gap-3 mb-5"
        >
          <div className="glass rounded-2xl p-5 dimensional">
            <div className="text-[10px] text-amber mb-3 font-ui tracking-[0.2em]">DONI COSMICI</div>
            <div className="space-y-2">
              {profile.strengths?.slice(0, 3).map((s, i) => (
                <div key={i} className="text-sm text-text-secondary flex items-start gap-2 font-body">
                  <span className="text-amber shrink-0">&#9670;</span><span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-5 dimensional">
            <div className="text-[10px] text-sienna mb-3 font-ui tracking-[0.2em]">OMBRE ATTIVE</div>
            <div className="space-y-2">
              {profile.shadows?.slice(0, 3).map((s, i) => (
                <div key={i} className="text-sm text-text-secondary flex items-start gap-2 font-body">
                  <span className="text-sienna shrink-0">&#9681;</span><span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
