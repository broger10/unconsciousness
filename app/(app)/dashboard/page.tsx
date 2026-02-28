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
  venusSign: string;
  marsSign: string;
  chironSign: string;
  northNodeSign: string;
  awarenessScore: number;
  values: string[];
  blindSpots: string[];
  strengths: string[];
  shadows: string[];
  personalitySummary: string;
  mythologyNarrative: string;
  shadowMapNarrative: string;
  onboardingComplete: boolean;
}

const zodiacEmojis: Record<string, string> = {
  Ariete: "♈", Toro: "♉", Gemelli: "♊", Cancro: "♋",
  Leone: "♌", Vergine: "♍", Bilancia: "♎", Scorpione: "♏",
  Sagittario: "♐", Capricorno: "♑", Acquario: "♒", Pesci: "♓",
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("scopri");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dailyInsight, setDailyInsight] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setDailyInsight(data.dailyInsight || "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="text-5xl cosmic-breathe mb-4">✦</div>
          <p className="text-text-muted text-sm">Allineo le stelle...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile || !profile.onboardingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="text-7xl mb-6 cosmic-breathe">✦</div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Il tuo cielo
            <br />
            <span className="text-gradient-cosmic">ti aspetta</span>
          </h1>
          <p className="text-text-secondary mb-10">
            Tre minuti per aprire il portale della consapevolezza cosmica.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="text-lg px-12 py-6 cosmic-breathe">
              Apri il portale
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-15" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-6 pb-28">
        {/* Mini identity bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-4 mb-8 text-sm text-text-muted"
        >
          <span>{zodiacEmojis[profile.sunSign] || "☀"} {profile.sunSign}</span>
          <span className="text-border-light">·</span>
          <span>🌙 {profile.moonSign}</span>
          <span className="text-border-light">·</span>
          <span>↑ {profile.risingSign}</span>
        </motion.div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-8">
          {[
            { id: "scopri" as Tab, label: "SCOPRI", sub: "Chi sei davvero" },
            { id: "vivi" as Tab, label: "VIVI", sub: "Agisci e trasforma" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-2xl p-5 text-left transition-all duration-500 ${
                tab === t.id
                  ? "glass glow border-accent/20"
                  : "bg-bg-glass/30 border border-transparent hover:border-border"
              }`}
            >
              <div
                className={`text-2xl font-black tracking-tight ${
                  tab === t.id ? "text-gradient-cosmic" : "text-text-muted"
                }`}
              >
                {t.label}
              </div>
              <div className={`text-xs mt-1 ${tab === t.id ? "text-text-secondary" : "text-text-muted"}`}>
                {t.sub}
              </div>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {tab === "scopri" && (
            <motion.div
              key="scopri"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Il Tuo Cielo — Identity Card */}
              <Link href="/settings">
                <FeatureCard
                  gradient="from-violet-500/10 to-indigo-500/10"
                  borderColor="border-violet-500/15"
                  icon="✦"
                  title="Il Tuo Cielo"
                  subtitle="Tema natale completo"
                  description={`${zodiacEmojis[profile.sunSign] || ""} Sole ${profile.sunSign} · 🌙 Luna ${profile.moonSign} · ↑ ${profile.risingSign}`}
                  tag="IDENTITÀ COSMICA"
                  tagColor="text-violet-400"
                />
              </Link>

              {/* Mappa dell'Ombra */}
              <Link href="/settings">
                <FeatureCard
                  gradient="from-red-500/8 to-orange-500/8"
                  borderColor="border-red-500/10"
                  icon="🌑"
                  title="Mappa dell&apos;Ombra"
                  subtitle="I tuoi punti ciechi rivelati"
                  description={profile.shadows?.[0] || "Le ferite che nascondono i tuoi doni più grandi"}
                  tag="MAI VISTO PRIMA"
                  tagColor="text-red-400"
                />
              </Link>

              {/* Mitologia Personale */}
              <Link href="/settings">
                <FeatureCard
                  gradient="from-amber-500/8 to-yellow-500/8"
                  borderColor="border-amber-500/10"
                  icon="📜"
                  title="La Tua Mitologia"
                  subtitle="Il mito che sei qui per vivere"
                  description="Il tuo tema natale racconta una storia archetipica. Scoprila."
                  tag="NARRATIVA COSMICA"
                  tagColor="text-amber-400"
                />
              </Link>

              {/* Awareness Score */}
              <div className="glass rounded-2xl p-6 border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-accent mb-1">LIVELLO DI CONSAPEVOLEZZA</div>
                    <div className="text-4xl font-black text-gradient-cosmic">{profile.awarenessScore}%</div>
                  </div>
                  <div className="relative w-20 h-20">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(167,139,250,0.1)" strokeWidth="8" />
                      <motion.circle
                        cx="50" cy="50" r="42"
                        fill="none" stroke="url(#dash-grad)" strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(profile.awarenessScore / 100) * 264} 264`}
                        initial={{ strokeDasharray: "0 264" }}
                        animate={{ strokeDasharray: `${(profile.awarenessScore / 100) * 264} 264` }}
                        transition={{ duration: 2, ease: "easeOut" }}
                      />
                      <defs>
                        <linearGradient id="dash-grad" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#a78bfa" />
                          <stop offset="100%" stopColor="#f5d485" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.values?.slice(0, 4).map((v: string, i: number) => (
                    <span key={i} className="text-xs glass rounded-full px-3 py-1 text-accent">
                      {v}
                    </span>
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
              className="space-y-4"
            >
              {/* Oracolo di Oggi */}
              {dailyInsight && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass rounded-2xl p-6 glow border border-accent/10"
                >
                  <div className="text-xs text-accent mb-3 font-medium">✦ L&apos;ORACOLO DI OGGI</div>
                  <p className="text-text-primary leading-relaxed italic text-lg">
                    &ldquo;{dailyInsight}&rdquo;
                  </p>
                </motion.div>
              )}

              {/* Tre Visioni */}
              <Link href="/visions">
                <FeatureCard
                  gradient="from-purple-500/10 to-pink-500/10"
                  borderColor="border-purple-500/15"
                  icon="🔮"
                  title="Tre Visioni"
                  subtitle="Il tuo futuro, triplicato"
                  description="Fuoco, Acqua, Stella — tre destini costruiti sul tuo cielo"
                  tag="GENERATORE DESTINO"
                  tagColor="text-purple-400"
                />
              </Link>

              {/* Rituale Cosmico */}
              <Link href="/ritual">
                <FeatureCard
                  gradient="from-blue-500/8 to-cyan-500/8"
                  borderColor="border-blue-500/10"
                  icon="🌙"
                  title="Rituale Cosmico"
                  subtitle="Check-in giornaliero"
                  description="Mood, energia, allineamento — l'AI ti legge i pattern nascosti"
                  tag="OGNI GIORNO"
                  tagColor="text-blue-400"
                />
              </Link>

              {/* Strengths + Shadows quick view */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-2xl p-5 border border-border">
                  <div className="text-xs text-amber-400 mb-3">DONI COSMICI</div>
                  <div className="space-y-2">
                    {profile.strengths?.slice(0, 3).map((s: string, i: number) => (
                      <div key={i} className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-amber-400 shrink-0">✦</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass rounded-2xl p-5 border border-border">
                  <div className="text-xs text-red-400 mb-3">PUNTI CIECHI</div>
                  <div className="space-y-2">
                    {profile.blindSpots?.slice(0, 3).map((b: string, i: number) => (
                      <div key={i} className="text-sm text-text-secondary flex items-start gap-2">
                        <span className="text-red-400 shrink-0">⊘</span>
                        <span>{b}</span>
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

function FeatureCard({
  gradient,
  borderColor,
  icon,
  title,
  subtitle,
  description,
  tag,
  tagColor,
}: {
  gradient: string;
  borderColor: string;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  tagColor: string;
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      className={`rounded-2xl p-6 border ${borderColor} bg-gradient-to-br ${gradient}
        hover:glow transition-all duration-500 cursor-pointer group`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{icon}</div>
        <span className={`text-[10px] font-bold tracking-wider ${tagColor} opacity-60`}>
          {tag}
        </span>
      </div>
      <h3 className="text-xl font-bold mb-1 group-hover:text-gradient-cosmic transition-all">
        {title}
      </h3>
      <p className="text-sm text-text-secondary mb-2">{subtitle}</p>
      <p className="text-xs text-text-muted leading-relaxed">{description}</p>
      <div className="mt-4 flex items-center gap-1 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
        <span>Esplora</span>
        <span>→</span>
      </div>
    </motion.div>
  );
}
