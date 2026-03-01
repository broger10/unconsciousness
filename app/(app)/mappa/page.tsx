"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LazyMarkdownText as MarkdownText } from "@/components/lazy-markdown";
import { decodeHtmlEntities } from "@/lib/utils";
import {
  Sun, Moon, ArrowUp, Zap, Heart, Swords, Crown, Hourglass,
  Cross, Compass, Diamond, Sparkle, ChevronDown, Eye, Star,
  type LucideIcon,
} from "lucide-react";

const premium = [0.16, 1, 0.3, 1] as const;

const cosmicLevels = [
  { name: "Iniziato", min: 0, max: 15 },
  { name: "Cercatore", min: 16, max: 40 },
  { name: "Mistico", min: 41, max: 70 },
  { name: "Oracolo", min: 71, max: 100 },
];

interface Profile {
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  mercurySign?: string;
  venusSign?: string;
  marsSign?: string;
  jupiterSign?: string;
  saturnSign?: string;
  chironSign?: string;
  northNodeSign?: string;
  natalChartData?: {
    elements?: Record<string, number>;
    modalities?: Record<string, number>;
    dominantPlanet?: string;
    criticalAspects?: string[];
  };
  shadows?: string[];
  strengths?: string[];
  blindSpots?: string[];
  values?: string[];
  personalitySummary?: string;
  mythologyNarrative?: string;
  shadowMapNarrative?: string;
  awarenessScore?: number;
}

const planets = [
  { key: "sunSign", name: "Sole", Icon: Sun, desc: "La tua essenza — chi sei nel nucleo" },
  { key: "moonSign", name: "Luna", Icon: Moon, desc: "Il tuo mondo emotivo — come senti" },
  { key: "risingSign", name: "Ascendente", Icon: ArrowUp, desc: "La tua maschera sociale — come il mondo ti vede" },
  { key: "mercurySign", name: "Mercurio", Icon: Zap, desc: "La tua mente — come pensi e comunichi" },
  { key: "venusSign", name: "Venere", Icon: Heart, desc: "Il tuo amore — come ami e desideri bellezza" },
  { key: "marsSign", name: "Marte", Icon: Swords, desc: "La tua forza — come agisci e combatti" },
  { key: "jupiterSign", name: "Giove", Icon: Crown, desc: "La tua espansione — dove cresci e trovi fortuna" },
  { key: "saturnSign", name: "Saturno", Icon: Hourglass, desc: "La tua lezione — dove la vita ti mette alla prova" },
  { key: "chironSign", name: "Chirone", Icon: Cross, desc: "La tua ferita sacra — il dono nascosto nel dolore" },
  { key: "northNodeSign", name: "Nodo Nord", Icon: Compass, desc: "Il tuo destino — dove l'anima vuole andare" },
];

interface Transit {
  transitPlanet: string;
  transitSymbol: string;
  aspect: string;
  aspectSymbol: string;
  natalPlanet: string;
  natalSymbol: string;
  description: string;
  interpretation: string;
}

/* ────────────────────────────────────────────────────────
   Inline components
   ──────────────────────────────────────────────────────── */

function PathLine({ awarenessScore }: { awarenessScore: number }) {
  return (
    <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-sienna/20 via-amber/30 to-verdigris/20" />
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${Math.max(awarenessScore || 30, 20)}%` }}
        transition={{ duration: 2.5, ease: premium, delay: 0.5 }}
        className="absolute top-0 left-0 right-0 bg-gradient-to-b from-sienna via-amber to-verdigris"
        style={{ boxShadow: "0 0 8px rgba(201,168,76,0.3)" }}
      />
    </div>
  );
}

function StationNode({ color }: { color: "sienna" | "amber" | "verdigris" }) {
  const bg = { sienna: "bg-sienna", amber: "bg-amber", verdigris: "bg-verdigris" }[color];
  return (
    <div className="flex justify-center relative z-10">
      <div className={`w-3 h-3 rounded-full ${bg} breathe`} />
    </div>
  );
}

function Station({
  side,
  color,
  label,
  subtitle,
  children,
}: {
  side: "left" | "right" | "center";
  color: "sienna" | "amber" | "verdigris";
  label: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const textColor = { sienna: "text-sienna", amber: "text-amber", verdigris: "text-verdigris" }[color];

  const variants = {
    left:   { initial: { opacity: 0, x: -30 }, whileInView: { opacity: 1, x: 0 } },
    right:  { initial: { opacity: 0, x: 30 },  whileInView: { opacity: 1, x: 0 } },
    center: { initial: { opacity: 0, y: 20 },  whileInView: { opacity: 1, y: 0 } },
  };

  return (
    <div className="relative">
      <StationNode color={color} />
      <motion.div
        {...variants[side]}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: premium }}
        className={`mt-4 ${side === "left" ? "mr-6" : side === "right" ? "ml-6" : ""}`}
      >
        <div className={`text-[10px] ${textColor} font-ui tracking-[0.2em] mb-1 ${side === "center" ? "text-center" : side === "right" ? "text-right" : ""}`}>
          {label}
        </div>
        {subtitle && (
          <div className={`text-[10px] text-text-muted font-body italic mb-3 ${side === "center" ? "text-center" : side === "right" ? "text-right" : ""}`}>
            {subtitle}
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}

function ElementCircle({ name, value, color }: { name: string; value: number; color: string }) {
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const pct = Math.min(value * 10, 100);
  const offset = circumference * (1 - pct / 100);
  const strokeColors: Record<string, string> = {
    sienna: "#C4614A",
    "amber-dim": "#A08540",
    verdigris: "#4A9B8E",
    "verdigris-dim": "#3A7A6A",
  };
  const hex = strokeColors[color] || "#A08540";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="52" height="52" viewBox="0 0 52 52">
        <circle cx="26" cy="26" r={r} fill="none" stroke="currentColor" strokeWidth="2" className="text-bg-surface" />
        <motion.circle
          cx="26" cy="26" r={r}
          fill="none" stroke={hex} strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: offset }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: premium, delay: 0.3 }}
          transform="rotate(-90 26 26)"
        />
        <text x="26" y="30" textAnchor="middle" fill={hex} fontSize="12" fontWeight="bold">{value}</text>
      </svg>
      <span className="text-[10px] text-text-muted font-ui capitalize">{name}</span>
    </div>
  );
}

/* ── Station 1: LE RADICI ── */
function RootsContent({ profile }: { profile: Profile }) {
  const elements = profile.natalChartData?.elements;
  const modalities = profile.natalChartData?.modalities;
  const elementColorMap: Record<string, string> = {
    fuoco: "sienna", terra: "amber-dim", aria: "verdigris", acqua: "verdigris-dim",
  };

  return (
    <div className="space-y-5">
      {/* Big Three — trinità orizzontale */}
      <div className="flex justify-center gap-6">
        {([
          { Icon: Sun, sign: profile.sunSign, label: "Sole" },
          { Icon: Moon, sign: profile.moonSign, label: "Luna" },
          { Icon: ArrowUp, sign: profile.risingSign, label: "Ascendente" },
        ] as const).map(({ Icon, sign, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-full glass dimensional flex items-center justify-center">
              <Icon size={22} className="text-sienna" />
            </div>
            <span className="text-xs font-bold font-display">{sign}</span>
            <span className="text-[10px] text-text-muted font-ui">{label}</span>
          </div>
        ))}
      </div>

      {/* Elementi — 4 cerchi SVG */}
      {elements && (
        <div className="grid grid-cols-4 gap-1 justify-items-center">
          {Object.entries(elements).map(([el, val]) => (
            <ElementCircle key={el} name={el} value={val as number} color={elementColorMap[el] || "amber-dim"} />
          ))}
        </div>
      )}

      {/* Modalità — pill badge */}
      {modalities && (
        <div className="flex justify-center gap-2 flex-wrap">
          {Object.entries(modalities).map(([mod, val]) => (
            <span key={mod} className="px-3 py-1 rounded-full text-xs font-ui glass capitalize text-text-secondary">
              {mod} <span className="text-amber font-bold">{val as number}</span>
            </span>
          ))}
        </div>
      )}

      {/* Pianeta dominante */}
      {profile.natalChartData?.dominantPlanet && (
        <div className="text-center">
          <span className="text-[10px] text-text-muted font-ui">Pianeta dominante: </span>
          <span className="text-xs text-sienna font-bold font-display">{profile.natalChartData.dominantPlanet}</span>
        </div>
      )}
    </div>
  );
}

/* ── Station 2: I PIANETI ── */
function PlanetsContent({
  profile,
  expanded,
  setExpanded,
}: {
  profile: Profile;
  expanded: string | null;
  setExpanded: (k: string | null) => void;
}) {
  return (
    <div className="glass rounded-2xl p-4 dimensional">
      <div className="space-y-1.5">
        {planets.map((p, i) => {
          const sign = profile[p.key as keyof Profile] as string | undefined;
          if (!sign) return null;
          const isOpen = expanded === p.key;
          const isBigThree = i < 3;

          return (
            <motion.div key={p.key} layout>
              <button
                onClick={() => setExpanded(isOpen ? null : p.key)}
                className={`w-full rounded-xl p-3 text-left transition-all duration-300 ${
                  isOpen ? "bg-bg-glass glow border border-amber/15" : "hover:bg-bg-glass"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <p.Icon
                      size={isBigThree ? 18 : 14}
                      className={isOpen ? "text-amber" : "text-text-muted"}
                    />
                    <div>
                      <span className={`font-bold font-display ${isBigThree ? "text-sm" : "text-xs"}`}>
                        {p.name}
                      </span>
                      <span className="text-amber text-sm ml-2 font-body">{sign}</span>
                    </div>
                  </div>
                  <ChevronDown
                    size={12}
                    className={`text-text-muted transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ ease: premium }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 py-3 text-sm text-text-secondary font-body italic leading-relaxed">
                      {p.desc}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Station 3: L'OMBRA ── */
function ShadowContent({
  profile,
  showShadows,
  setShowShadows,
}: {
  profile: Profile;
  showShadows: boolean;
  setShowShadows: (v: boolean) => void;
}) {
  return (
    <div className="glass rounded-2xl p-5 dimensional border border-sienna/10">
      {/* Header con reveal toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Eye size={14} className="text-sienna" />
          <span className="text-xs text-text-muted font-ui">Guarda nell&apos;oscurit&agrave;</span>
        </div>
        <button
          onClick={() => setShowShadows(!showShadows)}
          className="text-[10px] text-amber font-ui tracking-wide"
        >
          {showShadows ? "Nascondi" : "Rivela"}
        </button>
      </div>

      {/* Shadow map narrative */}
      {profile.shadowMapNarrative && (
        <div className={`text-text-secondary font-body italic leading-relaxed mb-4 transition-all duration-500 ${
          showShadows ? "" : "curiosity-blur"
        }`}>
          <MarkdownText content={profile.shadowMapNarrative} />
        </div>
      )}

      {/* Shadow list */}
      <div className={`space-y-2 transition-all duration-500 ${showShadows ? "" : "curiosity-blur"}`}>
        {profile.shadows?.map((s, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-bg-glass">
            <Eye size={16} className="text-sienna shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold font-display text-text-primary">{s}</div>
              <div className="text-[10px] text-text-muted font-body">L&apos;ombra che nasconde un dono</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chirone — La Ferita Sacra */}
      {profile.chironSign && (
        <div className={`mt-4 p-3 rounded-xl bg-bg-glass border border-sienna/10 transition-all duration-500 ${
          showShadows ? "" : "curiosity-blur"
        }`}>
          <div className="flex items-center gap-2">
            <Cross size={16} className="text-sienna" />
            <div>
              <span className="text-xs font-bold font-display">La Ferita Sacra</span>
              <span className="text-xs text-sienna ml-2 font-body">{profile.chironSign}</span>
            </div>
          </div>
        </div>
      )}

      {/* Aspetti critici */}
      {profile.natalChartData?.criticalAspects && profile.natalChartData.criticalAspects.length > 0 && (
        <div className={`mt-4 transition-all duration-500 ${showShadows ? "" : "curiosity-blur"}`}>
          <div className="text-[10px] text-sienna font-ui tracking-[0.2em] mb-2">ASPETTI CRITICI</div>
          <div className="space-y-1.5">
            {profile.natalChartData.criticalAspects.map((asp, i) => (
              <div key={i} className="text-sm text-text-secondary font-body flex items-start gap-2">
                <Sparkle size={10} className="text-sienna shrink-0 mt-1" />
                <span>{asp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Blind spots */}
      {profile.blindSpots && profile.blindSpots.length > 0 && (
        <div className={`mt-4 transition-all duration-500 ${showShadows ? "" : "curiosity-blur"}`}>
          <div className="text-[10px] text-sienna/70 font-ui tracking-[0.2em] mb-2">PUNTI CIECHI</div>
          <div className="space-y-1.5">
            {profile.blindSpots.map((b, i) => (
              <div key={i} className="text-sm text-text-secondary font-body flex items-start gap-2">
                <Eye size={10} className="text-sienna/50 shrink-0 mt-1" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Station 4: I DONI ── */
function GiftsContent({ profile }: { profile: Profile }) {
  return (
    <div className="space-y-4">
      {/* Mitologia — citazione centrale */}
      {profile.mythologyNarrative && (
        <div className="glass rounded-2xl p-6 dimensional glow border border-amber/10">
          <div className="text-[10px] text-amber font-ui tracking-[0.2em] mb-4">
            <Diamond size={10} className="inline" /> LA TUA MITOLOGIA
          </div>
          <div className="text-text-primary font-body italic leading-relaxed text-lg">
            &ldquo;<MarkdownText content={profile.mythologyNarrative} className="inline" />&rdquo;
          </div>
        </div>
      )}

      {/* Doni & Valori — badge */}
      <div className="flex flex-wrap gap-2">
        {profile.strengths?.map((s, i) => (
          <span key={`s-${i}`} className="px-3 py-1.5 rounded-full text-xs font-ui glass text-amber border border-amber/15">
            <Diamond size={8} className="inline mr-1" />{s}
          </span>
        ))}
        {profile.values?.map((v, i) => (
          <span key={`v-${i}`} className="px-3 py-1.5 rounded-full text-xs font-ui glass text-verdigris border border-verdigris/15">
            <Sparkle size={8} className="inline mr-1" />{v}
          </span>
        ))}
      </div>

      {/* Specchio cosmico + awareness bar */}
      {profile.personalitySummary && (
        <div className="glass rounded-2xl p-5 dimensional">
          <div className="text-[10px] text-verdigris font-ui tracking-[0.2em] mb-3">LO SPECCHIO COSMICO</div>
          <MarkdownText content={profile.personalitySummary} className="text-text-secondary font-body leading-relaxed italic" />
          {profile.awarenessScore != null && profile.awarenessScore > 0 && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-text-muted font-ui tracking-wide">CONSAPEVOLEZZA</span>
                <span className="text-xs text-amber font-bold font-ui">{profile.awarenessScore}%</span>
              </div>
              <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${profile.awarenessScore}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 1, ease: premium }}
                  className="h-full rounded-full bg-gradient-to-r from-verdigris to-amber"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Station 5: IL DESTINO ── */
function DestinyContent({
  profile,
  transits,
  transitsMessage,
  awarenessScore,
}: {
  profile: Profile;
  transits: Transit[];
  transitsMessage: string | null;
  awarenessScore: number;
}) {
  const level = cosmicLevels.find((l) => awarenessScore >= l.min && awarenessScore <= l.max) || cosmicLevels[0];

  return (
    <div className="space-y-4">
      {/* Nodo Nord — La Stella Polare */}
      {profile.northNodeSign && (
        <div className="glass rounded-2xl p-5 dimensional border border-verdigris/15 glow">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-verdigris/10 flex items-center justify-center">
              <Star size={20} className="text-verdigris" />
            </div>
            <div>
              <div className="text-xs font-bold font-display">La Tua Stella Polare</div>
              <div className="text-sm text-verdigris font-body">{profile.northNodeSign}</div>
            </div>
          </div>
          <p className="text-sm text-text-secondary font-body italic leading-relaxed mt-2">
            Dove l&apos;anima vuole andare &mdash; la direzione del tuo destino evolutivo.
          </p>
        </div>
      )}

      {/* Transiti di oggi */}
      <div className="glass rounded-2xl p-5 dimensional border border-verdigris/10">
        <div className="text-[10px] text-verdigris font-ui tracking-[0.2em] mb-3">
          <Sun size={10} className="inline" /> IL CIELO DI OGGI
        </div>
        {transits.length > 0 ? (
          <div className="space-y-3">
            {transits.map((t, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-bg-glass">
                <div className="text-verdigris text-lg shrink-0 font-body">{t.transitSymbol}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold font-display text-text-primary mb-0.5">
                    {t.description}
                  </div>
                  <p className="text-xs text-text-secondary font-body italic leading-relaxed">
                    {decodeHtmlEntities(t.interpretation)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-muted font-body italic">
            {transitsMessage ? decodeHtmlEntities(transitsMessage) : "Il cielo \u00e8 quieto oggi. Un momento per integrare."}
          </p>
        )}
      </div>

      {/* Badge livello cosmico */}
      <div className="flex justify-center">
        <span className="px-4 py-2 rounded-full glass dimensional text-sm font-ui text-amber border border-amber/15">
          <Sparkle size={12} className="inline mr-1.5" />
          {level.name}
        </span>
      </div>

      {/* PDF download */}
      <div className="glass rounded-2xl p-5 dimensional border border-amber/10">
        <div className="flex items-center gap-3 mb-3">
          <Sparkle size={18} className="text-amber" />
          <div>
            <div className="text-sm font-bold font-display">Il tuo tema natale completo</div>
            <div className="text-[10px] text-text-muted font-ui">PDF premium con tutti i tuoi pianeti e la tua mitologia</div>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/pdf-report?method=credits"
            className="flex-1 py-2.5 rounded-xl text-sm font-ui text-center bg-amber text-bg-base dimensional hover:glow transition-all"
          >
            20 crediti
          </a>
          <button
            onClick={async () => {
              try {
                const res = await fetch("/api/stripe/payment", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ product: "pdf_report" }),
                });
                const data = await res.json();
                if (data.url) window.location.href = data.url;
              } catch { /* */ }
            }}
            className="flex-1 py-2.5 rounded-xl text-sm font-ui text-center glass border border-amber/15 text-amber hover:glow transition-all"
          >
            &euro;4,99
          </button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Main page
   ──────────────────────────────────────────────────────── */

export default function MappaPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showShadows, setShowShadows] = useState(false);
  const [transits, setTransits] = useState<Transit[]>([]);
  const [transitsMessage, setTransitsMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setProfile(d.profile);
        setLoading(false);

        if (d.profile?.onboardingComplete) {
          fetch("/api/transits")
            .then((r) => r.json())
            .then((t) => {
              if (t.transits) setTransits(t.transits);
              if (t.message) setTransitsMessage(t.message);
            })
            .catch(() => {});
        }
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Compass size={36} className="text-verdigris ember-pulse mb-4" />
          <p className="text-text-muted text-sm font-ui">Leggo le stelle...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Compass size={36} className="text-text-muted mb-4" />
          <p className="text-text-muted font-body">Completa l&apos;onboarding per vedere la tua mappa.</p>
        </div>
      </div>
    );
  }

  const awarenessScore = profile.awarenessScore ?? 0;

  return (
    <div className="min-h-screen relative">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12 relative">
        {/* Linea del sentiero */}
        <PathLine awarenessScore={awarenessScore} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: premium }}
          className="text-center mb-10 relative z-10"
        >
          <h1 className="text-2xl font-bold font-display mb-1">Il Sentiero</h1>
          <p className="text-[11px] text-text-muted font-body italic">
            La mappa della tua vita, verso la piena espressione di s&eacute;
          </p>
        </motion.div>

        {/* ── Le 5 stazioni ── */}
        <div className="space-y-12 relative z-10">
          {/* 1. LE RADICI */}
          <Station side="center" color="sienna" label="LE RADICI" subtitle="Da dove vieni cosmicamente">
            <RootsContent profile={profile} />
          </Station>

          {/* 2. I PIANETI */}
          <Station side="left" color="amber" label="I PIANETI" subtitle="Le forze che ti muovono">
            <PlanetsContent profile={profile} expanded={expanded} setExpanded={setExpanded} />
          </Station>

          {/* 3. L'OMBRA */}
          <Station side="right" color="sienna" label="L&apos;OMBRA" subtitle="Ci&ograve; che non vuoi vedere">
            <ShadowContent profile={profile} showShadows={showShadows} setShowShadows={setShowShadows} />
          </Station>

          {/* 4. I DONI */}
          <Station side="left" color="amber" label="I DONI" subtitle="La luce che porti nel mondo">
            <GiftsContent profile={profile} />
          </Station>

          {/* 5. IL DESTINO */}
          <Station side="center" color="verdigris" label="IL DESTINO" subtitle="Dove l&apos;anima vuole andare">
            <DestinyContent
              profile={profile}
              transits={transits}
              transitsMessage={transitsMessage}
              awarenessScore={awarenessScore}
            />
          </Station>
        </div>
      </div>
    </div>
  );
}
