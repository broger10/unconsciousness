"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";

const premium = [0.16, 1, 0.3, 1] as const;

interface Profile {
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  awarenessScore?: number;
  strengths?: string[];
  shadows?: string[];
  values?: string[];
  blindSpots?: string[];
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  onboardingComplete?: boolean;
  createdAt?: string;
}

interface UserData {
  name?: string;
  email?: string;
  image?: string;
  credits?: number;
}

const cosmicLevels = [
  { name: "Iniziato", min: 0, max: 15 },
  { name: "Cercatore", min: 16, max: 40 },
  { name: "Mistico", min: 41, max: 70 },
  { name: "Oracolo", min: 71, max: 100 },
];

function getCosmicLevel(score: number) {
  return cosmicLevels.find((l) => score >= l.min && score <= l.max) || cosmicLevels[0];
}

interface SubData {
  isPremium: boolean;
  plan: string;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export default function ProfiloPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ checkins: 0, journals: 0 });
  const [sub, setSub] = useState<SubData | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      fetch("/api/checkin").then((r) => r.json()).catch(() => ({ checkins: [], streak: 0 })),
      fetch("/api/journal").then((r) => r.json()).catch(() => ({ journals: [] })),
      fetch("/api/stripe/status").then((r) => r.json()).catch(() => null),
      fetch("/api/credits").then((r) => r.json()).catch(() => null),
    ])
      .then(([profileData, checkinData, journalData, subData, creditsData]) => {
        if (profileData.profile) setProfile(profileData.profile);
        if (profileData.user) setUser(profileData.user);
        setStats({
          checkins: checkinData.checkins?.length || 0,
          journals: journalData.journals?.length || 0,
        });
        if (subData) setSub(subData);
        if (creditsData?.credits !== undefined) setCredits(creditsData.credits);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpgrade = async (plan: "monthly" | "yearly") => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Errore nell'apertura del checkout. Riprova.");
    } catch {
      alert("Errore di connessione. Riprova.");
    } finally {
      setUpgrading(false);
    }
  };

  const handleManage = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert("Errore nell'apertura del portale. Riprova.");
    } catch {
      alert("Errore di connessione. Riprova.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-4xl text-amber ember-pulse mb-4">&#9681;</div>
          <p className="text-text-muted text-sm font-ui">Carico il tuo profilo...</p>
        </motion.div>
      </div>
    );
  }

  const awareness = profile?.awarenessScore || 0;
  const level = getCosmicLevel(awareness);
  const levelIndex = cosmicLevels.indexOf(level);
  const levelProgress = level.max > level.min
    ? ((awareness - level.min) / (level.max - level.min)) * 100
    : 0;

  return (
    <div className="min-h-screen relative">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-8">
        {/* Identity Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: premium }}
          className="glass rounded-2xl p-6 mb-5 dimensional glow border border-amber/10"
        >
          <div className="flex items-center gap-4 mb-4">
            {user?.image ? (
              <img
                src={user.image}
                alt={user?.name || "Profilo utente"}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-amber/20"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-bg-surface border-2 border-amber/20 flex items-center justify-center">
                <span className="text-2xl text-amber">&#9670;</span>
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold font-display">{user?.name || "Viaggiatore"}</h1>
              <div className="flex items-center gap-2 text-xs text-text-muted font-ui">
                {profile?.sunSign && <span>&#9788; {profile.sunSign}</span>}
                {profile?.moonSign && (
                  <>
                    <span className="text-border-light">&#183;</span>
                    <span>&#9790; {profile.moonSign}</span>
                  </>
                )}
                {profile?.risingSign && (
                  <>
                    <span className="text-border-light">&#183;</span>
                    <span>&#8593; {profile.risingSign}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Cosmic Level */}
          <div className="bg-bg-surface rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-amber">&#9670;</span>
                <span className="text-sm font-bold font-display">{level.name}</span>
              </div>
              <span className="text-xs text-amber font-ui font-bold">{awareness}%</span>
            </div>
            <div className="h-2 bg-bg-card rounded-full overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ delay: 0.3, duration: 1, ease: premium }}
                className="h-full rounded-full bg-gradient-to-r from-amber-dim to-amber"
              />
            </div>
            <div className="flex justify-between text-[10px] text-text-muted font-ui">
              {cosmicLevels.map((l, i) => (
                <span key={l.name} className={i <= levelIndex ? "text-amber" : ""}>
                  {l.name}
                </span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: premium }}
          className="grid grid-cols-4 gap-3 mb-5"
        >
          <div className="glass rounded-xl p-4 text-center dimensional">
            <div className="text-2xl font-bold font-display text-amber">
              {credits === -1 ? "∞" : credits ?? "—"}
            </div>
            <div className="text-[10px] text-text-muted font-ui tracking-wide mt-1">CREDITI</div>
          </div>
          <div className="glass rounded-xl p-4 text-center dimensional">
            <div className="text-2xl font-bold font-display text-amber">{stats.checkins}</div>
            <div className="text-[10px] text-text-muted font-ui tracking-wide mt-1">CHECK-IN</div>
          </div>
          <div className="glass rounded-xl p-4 text-center dimensional">
            <div className="text-2xl font-bold font-display text-verdigris">{stats.journals}</div>
            <div className="text-[10px] text-text-muted font-ui tracking-wide mt-1">RIFLESSIONI</div>
          </div>
          <div className="glass rounded-xl p-4 text-center dimensional">
            <div className="text-2xl font-bold font-display text-sienna">{profile?.shadows?.length || 0}</div>
            <div className="text-[10px] text-text-muted font-ui tracking-wide mt-1">OMBRE</div>
          </div>
        </motion.div>

        {/* Crediti */}
        {!sub?.isPremium && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, ease: premium }}
            className="glass rounded-2xl p-5 mb-5 dimensional border border-verdigris/10"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] text-verdigris font-ui tracking-[0.2em]">&#10038; I TUOI CREDITI</div>
              <span className="text-xl font-bold font-display text-verdigris">{user?.credits ?? 0}</span>
            </div>
            <p className="text-xs text-text-muted font-ui mb-3">
              Ogni azione AI costa crediti. Passa a Premium per accesso illimitato.
            </p>
            <div className="space-y-1 text-[10px] text-text-muted font-ui">
              <div className="flex justify-between"><span>Oroscopo giornaliero</span><span>3 crediti</span></div>
              <div className="flex justify-between"><span>Chat con l&apos;oracolo</span><span>5 crediti</span></div>
              <div className="flex justify-between"><span>Riflessione diario</span><span>3 crediti</span></div>
              <div className="flex justify-between"><span>3 Visioni del destino</span><span>15 crediti</span></div>
            </div>
          </motion.div>
        )}

        {/* Account */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, ease: premium }}
          className="glass rounded-2xl p-5 mb-5 dimensional"
        >
          <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-4">ACCOUNT</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <span className="text-xs text-text-muted font-ui">Email</span>
              <span className="text-sm text-text-primary font-ui">{user?.email || "—"}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/30">
              <span className="text-xs text-text-muted font-ui">Provider</span>
              <span className="text-sm text-text-primary font-ui flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-text-muted font-ui">Membro da</span>
              <span className="text-sm text-text-primary font-ui">
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("it-IT", { month: "long", year: "numeric" })
                  : "—"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Piano / Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, ease: premium }}
          className={`rounded-2xl p-5 mb-5 dimensional ${
            sub?.isPremium
              ? "glass glow border border-amber/15"
              : "glass"
          }`}
        >
          <div className="text-[10px] text-amber font-ui tracking-[0.2em] mb-4">
            {sub?.isPremium ? "&#9670; PREMIUM ATTIVO" : "IL TUO PIANO"}
          </div>

          {sub?.isPremium ? (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber text-lg">&#10038;</span>
                <span className="text-base font-bold font-display">
                  Premium {sub.plan === "yearly" ? "Annuale" : "Mensile"}
                </span>
              </div>
              {sub.currentPeriodEnd && (
                <p className="text-xs text-text-muted font-ui mb-1">
                  {sub.cancelAtPeriodEnd ? "Scade il" : "Si rinnova il"}{" "}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString("it-IT", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              <button
                onClick={handleManage}
                className="mt-3 text-xs text-amber font-ui hover:underline"
              >
                Gestisci abbonamento &#8594;
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-text-secondary font-body mb-4">
                Accesso illimitato a tutte le funzioni AI. Niente pi&ugrave; crediti da contare.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => handleUpgrade("monthly")}
                  disabled={upgrading}
                  className="rounded-xl p-4 bg-bg-surface border border-border/50 hover:border-amber/20 transition-all text-center group"
                >
                  <div className="text-lg font-bold font-display text-text-primary group-hover:text-amber transition-colors">&euro;6,99</div>
                  <div className="text-[10px] text-text-muted font-ui">/mese</div>
                </button>
                <button
                  onClick={() => handleUpgrade("yearly")}
                  disabled={upgrading}
                  className="rounded-xl p-4 bg-bg-surface border border-amber/20 hover:border-amber/40 transition-all text-center relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 bg-amber text-bg-base text-[8px] font-bold font-ui px-2 py-0.5 rounded-bl-lg">-40%</div>
                  <div className="text-lg font-bold font-display text-amber">&euro;49,99</div>
                  <div className="text-[10px] text-text-muted font-ui">/anno</div>
                </button>
              </div>
              <div className="space-y-1.5 text-[10px] text-text-muted font-ui">
                <div className="flex items-center gap-1.5"><span className="text-amber">&#9670;</span> Oracolo AI illimitato</div>
                <div className="flex items-center gap-1.5"><span className="text-amber">&#9670;</span> Mappa dell&apos;ombra completa</div>
                <div className="flex items-center gap-1.5"><span className="text-amber">&#9670;</span> Visioni del destino</div>
                <div className="flex items-center gap-1.5"><span className="text-amber">&#9670;</span> Riflessioni AI sul diario</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Birth Data */}
        {profile?.birthDate && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ease: premium }}
            className="glass rounded-2xl p-5 mb-5 dimensional"
          >
            <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-4">DATI DI NASCITA</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/30">
                <span className="text-xs text-text-muted font-ui">Data</span>
                <span className="text-sm text-text-primary font-ui">
                  {new Date(profile.birthDate + "T12:00:00").toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
              {profile.birthTime && (
                <div className="flex items-center justify-between py-2 border-b border-border/30">
                  <span className="text-xs text-text-muted font-ui">Ora</span>
                  <span className="text-sm text-text-primary font-ui">{profile.birthTime}</span>
                </div>
              )}
              {profile.birthCity && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-text-muted font-ui">Luogo</span>
                  <span className="text-sm text-text-primary font-ui">{profile.birthCity}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Privacy & Data */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, ease: premium }}
          className="glass rounded-2xl p-5 mb-5 dimensional"
        >
          <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-4">PRIVACY E DATI</div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 py-2">
              <span className="text-verdigris">&#9670;</span>
              <div>
                <div className="text-sm font-display font-bold">I tuoi dati sono tuoi</div>
                <div className="text-xs text-text-muted font-ui">Crittografia end-to-end. Zero vendita dati.</div>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <span className="text-verdigris">&#9670;</span>
              <div>
                <div className="text-sm font-display font-bold">AI locale</div>
                <div className="text-xs text-text-muted font-ui">Le tue conversazioni non vengono usate per addestrare modelli.</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: premium }}
          className="mb-8"
        >
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full glass rounded-xl p-4 text-center text-sienna text-sm font-ui hover:bg-sienna/10 transition-colors duration-300"
          >
            Esci dal portale
          </button>
        </motion.div>

        {/* Version */}
        <div className="text-center text-[10px] text-text-muted/50 font-ui pb-4">
          <span className="text-amber">un</span>consciousness v1.0 &middot; il cosmo ti aspetta
        </div>
      </div>
    </div>
  );
}
