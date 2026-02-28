"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Profile {
  awarenessScore: number;
  values: string[];
  blindSpots: string[];
  strengths: string[];
  personalitySummary: string | null;
  onboardingComplete: boolean;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (!data.profile?.onboardingComplete) {
          router.push("/onboarding");
          return;
        }
        setProfile(data.profile);
        setUserName(data.user?.name || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-text-secondary mb-4">Nessun profilo trovato.</p>
        <Link href="/onboarding">
          <Button>Inizia la scoperta</Button>
        </Link>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buongiorno";
    if (hour < 18) return "Buon pomeriggio";
    return "Buonasera";
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className="max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          {greeting()}, {userName?.split(" ")[0] || "Esploratore"}
        </h1>
        <p className="text-text-secondary">Ecco il tuo specchio oggi.</p>
      </motion.div>

      {/* Awareness Score */}
      <motion.div variants={fadeInUp}>
        <Card variant="glow" className="mb-6 text-center py-10">
          <div className="text-xs text-text-muted uppercase tracking-wider mb-3">
            Awareness Score
          </div>
          <div className="relative inline-block">
            <svg className="w-32 h-32" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="var(--bg-tertiary)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(profile.awarenessScore / 100) * 327} 327`}
                transform="rotate(-90 60 60)"
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--accent-secondary)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold font-mono">{profile.awarenessScore}</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Blind Spots */}
        <motion.div variants={fadeInUp}>
          <Card variant="glass" className="h-full">
            <h3 className="text-sm font-semibold text-warning mb-4 uppercase tracking-wider flex items-center gap-2">
              <span>!</span> Punti ciechi
            </h3>
            <ul className="space-y-3">
              {profile.blindSpots.map((spot) => (
                <li
                  key={spot}
                  className="text-sm text-text-secondary flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-warning/50 mt-1.5 shrink-0" />
                  {spot}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>

        {/* Strengths */}
        <motion.div variants={fadeInUp}>
          <Card variant="glass" className="h-full">
            <h3 className="text-sm font-semibold text-success mb-4 uppercase tracking-wider flex items-center gap-2">
              <span>+</span> Punti di forza
            </h3>
            <ul className="space-y-3">
              {profile.strengths.map((s) => (
                <li
                  key={s}
                  className="text-sm text-text-secondary flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-success/50 mt-1.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>

      {/* Values */}
      <motion.div variants={fadeInUp}>
        <Card variant="glass" className="mb-6">
          <h3 className="text-sm font-semibold text-accent mb-3 uppercase tracking-wider">
            I tuoi valori
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.values.map((v) => (
              <span
                key={v}
                className="px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm border border-accent/20"
              >
                {v}
              </span>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={fadeInUp}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/visions">
            <Card
              variant="glass"
              className="group hover:border-accent/20 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">🔮</div>
                <div>
                  <h3 className="font-semibold group-hover:text-accent transition-colors">
                    Genera una Visione
                  </h3>
                  <p className="text-text-muted text-sm">
                    3 futuri personalizzati per la tua prossima decisione
                  </p>
                </div>
              </div>
            </Card>
          </Link>
          <Link href="/ritual">
            <Card
              variant="glass"
              className="group hover:border-accent/20 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">⚡</div>
                <div>
                  <h3 className="font-semibold group-hover:text-accent transition-colors">
                    Check-in Giornaliero
                  </h3>
                  <p className="text-text-muted text-sm">
                    5 minuti per scoprire un pattern nascosto
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
