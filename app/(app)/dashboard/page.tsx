"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Tab = "scopri" | "vivi";

interface Profile {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  awarenessScore: number;
  values: string[];
  blindSpots: string[];
  strengths: string[];
  shadows: string[];
  personalitySummary: string;
  mythologyNarrative: string;
  onboardingComplete: boolean;
}

const zodiac: Record<string, string> = {
  Ariete: "\u2648", Toro: "\u2649", Gemelli: "\u264A", Cancro: "\u264B",
  Leone: "\u264C", Vergine: "\u264D", Bilancia: "\u264E", Scorpione: "\u264F",
  Sagittario: "\u2650", Capricorno: "\u2651", Acquario: "\u2652", Pesci: "\u2653",
  Aries: "\u2648", Taurus: "\u2649", Gemini: "\u264A", Cancer: "\u264B",
  Leo: "\u264C", Virgo: "\u264D", Libra: "\u264E", Scorpio: "\u264F",
  Sagittarius: "\u2650", Capricorn: "\u2651", Aquarius: "\u2652", Pisces: "\u2653",
};

/* Premium deceleration curve */
const premium = [0.16, 1, 0.3, 1] as const;

/* Cosmic progression levels */
const levels = [
  { name: "Iniziato", min: 0, symbol: "&#9676;", color: "text-text-muted" },
  { name: "Cercatore", min: 20, symbol: "&#9681;", color: "text-amber-dim" },
  { name: "Mistico", min: 50, symbol: "&#9670;", color: "text-amber" },
  { name: "Oracolo", min: 80, symbol: "&#10038;", color: "text-amber-glow" },
];

function getLevel(score: number) {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (score >= levels[i].min) return { ...levels[i], index: i };
  }
  return { ...levels[0], index: 0 };
}

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("scopri");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyInsight, setDailyInsight] = useState("");
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/checkin").then((r) => r.json()).catch(() => ({ streak: 0 })),
    ]).then(([profileData, checkinData]) => {
      if (profileData.profile) {
        setProfile(profileData.profile);
        setDailyInsight(profileData.dailyInsight || "");
      }
      if (checkinData.streak) setStreak(checkinData.streak);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

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

  if (!profile || !profile.onboardingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative">
        <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: premium }}
          className="text-center max-w-md relative z-10"
        >
          <div className="text-6xl text-amber mb-6 breathe">&#9670;</div>
          <h1 className="text-4xl font-bold font-display mb-4 leading-tight">
            Il tuo cielo <br /><span className="text-gradient">ti aspetta</span>
          </h1>
          <p className="text-text-secondary mb-10 font-body text-lg italic">
            Tre minuti per aprire il portale della consapevolezza cosmica.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="text-lg px-12 py-6 breathe dimensional">Apri il portale</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const level = getLevel(profile.awarenessScore);
  const nextLevel = levels[level.index + 1];

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="fixed inset-0 alchemy-bg pointer-events-none opacity-15" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-28">
        {/* Identity bar + streak */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: premium }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3 text-sm text-text-muted font-ui">
            <span>{zodiac[profile.sunSign] || "&#9788;"} {profile.sunSign}</span>
            <span className="text-border-light">&#183;</span>
            <span>&#9790; {profile.moonSign}</span>
            <span className="text-border-light">&#183;</span>
            <span>&#8593; {profile.risingSign}</span>
          </div>
          {streak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
              className="flex items-center gap-1.5 glass rounded-full px-3 py-1.5"
            >
              <span className="text-amber text-xs ember-pulse">&#9670;</span>
              <span className="text-amber text-xs font-bold font-ui">{streak}</span>
              <span className="text-text-muted text-[10px] font-ui">giorni</span>
            </motion.div>
          )}
        </motion.div>

        {/* Cosmic Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: premium }}
          className="glass rounded-2xl p-5 mb-6 dimensional"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className={`text-2xl ${level.color}`} dangerouslySetInnerHTML={{ __html: level.symbol }} />
              <div>
                <div className="text-xs text-text-muted font-ui tracking-wider">LIVELLO COSMICO</div>
                <div className={`text-lg font-bold font-display ${level.color}`}>{level.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black font-display text-gradient">{profile.awarenessScore}%</div>
              <div className="text-[10px] text-text-muted font-ui">consapevolezza</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="relative h-1.5 rounded-full bg-bg-card overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: "linear-gradient(90deg, #C9A96E, #4E9E8A)" }}
              initial={{ width: "0%" }}
              animate={{ width: `${profile.awarenessScore}%` }}
              transition={{ duration: 1.5, ease: premium }}
            />
          </div>
          {nextLevel && (
            <div className="mt-2 flex justify-between text-[10px] text-text-muted font-ui">
              <span>{level.name}</span>
              <span>{nextLevel.name} a {nextLevel.min}%</span>
            </div>
          )}
          {/* Level progression dots */}
          <div className="mt-3 flex items-center justify-center gap-2">
            {levels.map((l, i) => (
              <div key={l.name} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
                  i <= level.index ? "bg-amber" : "bg-bg-card"
                } ${i === level.index ? "ember-pulse ring-2 ring-amber/20" : ""}`} />
                {i < levels.length - 1 && (
                  <div className={`w-6 h-px ${i < level.index ? "bg-amber/40" : "bg-bg-card"}`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6">
          {([
            { id: "scopri" as Tab, label: "SCOPRI", sub: "Chi sei davvero" },
            { id: "vivi" as Tab, label: "VIVI", sub: "Agisci e trasforma" },
          ]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-2xl p-5 text-left transition-all duration-500 ${
                tab === t.id
                  ? "glass glow border-amber/15 dimensional"
                  : "bg-bg-glass/30 border border-transparent hover:border-border"
              }`}
            >
              <div className={`text-2xl font-black tracking-tight font-display ${
                tab === t.id ? "text-gradient" : "text-text-muted"
              }`}>
                {t.label}
              </div>
              <div className={`text-xs mt-1 font-ui ${tab === t.id ? "text-text-secondary" : "text-text-muted"}`}>
                {t.sub}
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {tab === "scopri" && (
            <motion.div
              key="scopri"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4, ease: premium }}
              className="space-y-4"
            >
              <Link href="/settings">
                <motion.div whileTap={{ scale: 0.98 }} className="rounded-2xl p-6 border border-amber/15 bg-gradient-to-br from-amber/8 to-verdigris/5 hover:glow transition-all duration-500 cursor-pointer group dimensional">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl text-amber">&#9670;</div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-amber/60 font-ui">IDENTIT&Agrave; COSMICA</span>
                  </div>
                  <h3 className="text-xl font-bold font-display mb-1">Il Tuo Cielo</h3>
                  <p className="text-sm text-text-secondary font-ui mb-2">Tema natale completo</p>
                  <p className="text-xs text-text-muted font-body">{zodiac[profile.sunSign]} Sole {profile.sunSign} &#183; &#9790; Luna {profile.moonSign} &#183; &#8593; {profile.risingSign}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-amber opacity-0 group-hover:opacity-100 transition-opacity font-ui">Esplora &#8594;</div>
                </motion.div>
              </Link>

              <Link href="/settings">
                <motion.div whileTap={{ scale: 0.98 }} className="rounded-2xl p-6 border border-sienna/10 bg-gradient-to-br from-sienna/6 to-amber/3 hover:glow transition-all duration-500 cursor-pointer group dimensional">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl text-sienna">&#9681;</div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-sienna/60 font-ui">MAI VISTO PRIMA</span>
                  </div>
                  <h3 className="text-xl font-bold font-display mb-1">Mappa dell&apos;Ombra</h3>
                  <p className="text-sm text-text-secondary font-ui mb-2">I tuoi punti ciechi rivelati</p>
                  {/* Curiosity gap — partially blurred content */}
                  <p className="text-xs text-text-muted font-body italic">{profile.shadows?.[0] || "Le ferite che nascondono i doni pi\u00f9 grandi"}</p>
                  {profile.shadows && profile.shadows.length > 1 && (
                    <p className="text-xs text-text-muted/40 font-body italic mt-1 curiosity-blur">
                      {profile.shadows[1]} &#183; e altre ombre nascoste che solo tu puoi vedere...
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-xs text-sienna opacity-0 group-hover:opacity-100 transition-opacity font-ui">Esplora &#8594;</div>
                </motion.div>
              </Link>

              <Link href="/settings">
                <motion.div whileTap={{ scale: 0.98 }} className="rounded-2xl p-6 border border-amber-glow/10 bg-gradient-to-br from-amber-glow/5 to-amber/3 hover:glow transition-all duration-500 cursor-pointer group dimensional">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl text-amber-glow">&#10038;</div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-amber-glow/60 font-ui">NARRATIVA COSMICA</span>
                  </div>
                  <h3 className="text-xl font-bold font-display mb-1">La Tua Mitologia</h3>
                  <p className="text-sm text-text-secondary font-ui mb-2">Il mito che sei qui per vivere</p>
                  {profile.mythologyNarrative ? (
                    <p className="text-xs text-text-muted font-body italic curiosity-blur">{profile.mythologyNarrative.slice(0, 120)}...</p>
                  ) : (
                    <p className="text-xs text-text-muted font-body italic">La storia archetipica scritta nel tuo cielo.</p>
                  )}
                  <div className="mt-4 flex items-center gap-1 text-xs text-amber-glow opacity-0 group-hover:opacity-100 transition-opacity font-ui">Esplora &#8594;</div>
                </motion.div>
              </Link>

              {/* Awareness Score with ring */}
              <div className="glass rounded-2xl p-6 dimensional">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-amber mb-1 font-ui tracking-wider">CONSAPEVOLEZZA</div>
                    <div className="text-4xl font-black font-display text-gradient">{profile.awarenessScore}%</div>
                  </div>
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(201,169,110,0.1)" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r="42" fill="none" stroke="url(#alch-grad)" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(profile.awarenessScore / 100) * 264} 264`}
                        initial={{ strokeDasharray: "0 264" }}
                        animate={{ strokeDasharray: `${(profile.awarenessScore / 100) * 264} 264` }}
                        transition={{ duration: 2, ease: premium }}
                      />
                      <defs>
                        <linearGradient id="alch-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#C9A96E" />
                          <stop offset="100%" stopColor="#4E9E8A" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.values?.slice(0, 4).map((v: string, i: number) => (
                    <span key={i} className="text-xs glass rounded-full px-3 py-1 text-amber font-ui">{v}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === "vivi" && (
            <motion.div
              key="vivi"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: premium }}
              className="space-y-4"
            >
              {dailyInsight && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: premium }}
                  className="glass rounded-2xl p-6 glow border border-amber/10 dimensional"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-amber font-ui tracking-wider">&#9670; L&apos;ORACOLO DI OGGI</div>
                    <div className="text-[10px] text-text-muted font-ui">
                      {new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long" })}
                    </div>
                  </div>
                  <p className="text-text-primary leading-relaxed italic text-lg font-body">
                    &ldquo;{dailyInsight}&rdquo;
                  </p>
                </motion.div>
              )}

              {/* Streak card — only when streak exists */}
              {streak > 0 && (
                <div className="glass rounded-2xl p-5 flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 rounded-full bg-amber"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05, type: "spring" }}
                      />
                    ))}
                    {streak > 7 && <span className="text-amber text-xs font-ui ml-1">+{streak - 7}</span>}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-amber font-ui tracking-wider">{streak} GIORNI CONSECUTIVI</div>
                    <div className="text-[10px] text-text-muted font-ui">
                      {streak >= 30 ? "Sei un Oracolo della costanza" : streak >= 7 ? "La tua connessione cosmica si rafforza" : "Continua cos\u00ec, le stelle ti osservano"}
                    </div>
                  </div>
                </div>
              )}

              <Link href="/visions">
                <motion.div whileTap={{ scale: 0.98 }} className="rounded-2xl p-6 border border-verdigris/15 bg-gradient-to-br from-verdigris/8 to-amber/3 hover:glow transition-all duration-500 cursor-pointer group dimensional">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl text-verdigris">&#9672;</div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-verdigris/60 font-ui">GENERATORE DESTINO</span>
                  </div>
                  <h3 className="text-xl font-bold font-display mb-1">Tre Visioni</h3>
                  <p className="text-sm text-text-secondary font-ui mb-2">Il tuo futuro, triplicato</p>
                  <p className="text-xs text-text-muted font-body">Fuoco, Acqua, Stella — tre destini costruiti sul tuo cielo</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-verdigris opacity-0 group-hover:opacity-100 transition-opacity font-ui">Genera &#8594;</div>
                </motion.div>
              </Link>

              <Link href="/ritual">
                <motion.div whileTap={{ scale: 0.98 }} className="rounded-2xl p-6 border border-amber/10 bg-gradient-to-br from-amber/5 to-sienna/3 hover:glow transition-all duration-500 cursor-pointer group dimensional">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl text-amber">&#9790;</div>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-amber/60 font-ui">OGNI GIORNO</span>
                  </div>
                  <h3 className="text-xl font-bold font-display mb-1">Rituale Cosmico</h3>
                  <p className="text-sm text-text-secondary font-ui mb-2">Check-in giornaliero</p>
                  <p className="text-xs text-text-muted font-body">Mood, energia, allineamento — l&apos;AI ti legge i pattern nascosti</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-amber opacity-0 group-hover:opacity-100 transition-opacity font-ui">Inizia &#8594;</div>
                </motion.div>
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-2xl p-5 dimensional">
                  <div className="text-xs text-amber mb-3 font-ui tracking-wider">DONI COSMICI</div>
                  <div className="space-y-2">
                    {profile.strengths?.slice(0, 3).map((s: string, i: number) => (
                      <div key={i} className="text-sm text-text-secondary flex items-start gap-2 font-body">
                        <span className="text-amber shrink-0">&#9670;</span><span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-5 dimensional">
                  <div className="text-xs text-sienna mb-3 font-ui tracking-wider">PUNTI CIECHI</div>
                  <div className="space-y-2">
                    {profile.blindSpots?.slice(0, 3).map((b: string, i: number) => (
                      <div key={i} className="text-sm text-text-secondary flex items-start gap-2 font-body">
                        <span className="text-sienna shrink-0">&#9676;</span><span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
