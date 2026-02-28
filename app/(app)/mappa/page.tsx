"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const premium = [0.16, 1, 0.3, 1] as const;

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
  { key: "sunSign", name: "Sole", symbol: "&#9788;", desc: "La tua essenza — chi sei nel nucleo" },
  { key: "moonSign", name: "Luna", symbol: "&#9790;", desc: "Il tuo mondo emotivo — come senti" },
  { key: "risingSign", name: "Ascendente", symbol: "&#8593;", desc: "La tua maschera sociale — come il mondo ti vede" },
  { key: "mercurySign", name: "Mercurio", symbol: "&#9791;", desc: "La tua mente — come pensi e comunichi" },
  { key: "venusSign", name: "Venere", symbol: "&#9792;", desc: "Il tuo amore — come ami e desideri bellezza" },
  { key: "marsSign", name: "Marte", symbol: "&#9794;", desc: "La tua forza — come agisci e combatti" },
  { key: "jupiterSign", name: "Giove", symbol: "&#9795;", desc: "La tua espansione — dove cresci e trovi fortuna" },
  { key: "saturnSign", name: "Saturno", symbol: "&#9796;", desc: "La tua lezione — dove la vita ti mette alla prova" },
  { key: "chironSign", name: "Chirone", symbol: "&#9919;", desc: "La tua ferita sacra — il dono nascosto nel dolore" },
  { key: "northNodeSign", name: "Nodo Nord", symbol: "&#9738;", desc: "Il tuo destino — dove l'anima vuole andare" },
];

export default function MappaPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showShadows, setShowShadows] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setProfile(d.profile);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="text-4xl text-verdigris ember-pulse mb-4">&#9672;</div>
          <p className="text-text-muted text-sm font-ui">Leggo le stelle...</p>
        </motion.div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl text-text-muted mb-4">&#9672;</div>
          <p className="text-text-muted font-body">Completa l&apos;onboarding per vedere la tua mappa.</p>
        </div>
      </div>
    );
  }

  const elements = profile.natalChartData?.elements;
  const modalities = profile.natalChartData?.modalities;

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
          <h1 className="text-2xl font-bold font-display mb-1">La Tua Mappa</h1>
          <div className="flex items-center gap-3 text-xs text-text-muted font-ui">
            <span>&#9788; {profile.sunSign}</span>
            <span className="text-border-light">&#183;</span>
            <span>&#9790; {profile.moonSign}</span>
            <span className="text-border-light">&#183;</span>
            <span>&#8593; {profile.risingSign}</span>
          </div>
        </motion.div>

        {/* Elementi & Modalità */}
        {(elements || modalities) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, ease: premium }}
            className="grid grid-cols-2 gap-3 mb-5"
          >
            {elements && (
              <div className="glass rounded-2xl p-4 dimensional">
                <div className="text-[10px] text-amber font-ui tracking-[0.2em] mb-3">ELEMENTI</div>
                <div className="space-y-2">
                  {Object.entries(elements).map(([el, val]) => (
                    <div key={el} className="flex items-center gap-2">
                      <span className="text-xs text-text-muted font-ui w-14 capitalize">{el}</span>
                      <div className="flex-1 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((val as number) * 10, 100)}%` }}
                          transition={{ delay: 0.3, duration: 0.8, ease: premium }}
                          className={`h-full rounded-full ${
                            el === "fuoco" ? "bg-sienna" :
                            el === "terra" ? "bg-amber-dim" :
                            el === "aria" ? "bg-verdigris" :
                            "bg-verdigris-dim"
                          }`}
                        />
                      </div>
                      <span className="text-xs text-text-muted font-ui w-4 text-right">{val as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {modalities && (
              <div className="glass rounded-2xl p-4 dimensional">
                <div className="text-[10px] text-verdigris font-ui tracking-[0.2em] mb-3">MODALIT&Agrave;</div>
                <div className="space-y-2">
                  {Object.entries(modalities).map(([mod, val]) => (
                    <div key={mod} className="flex items-center gap-2">
                      <span className="text-xs text-text-muted font-ui w-14 capitalize">{mod}</span>
                      <div className="flex-1 h-1.5 bg-bg-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((val as number) * 10, 100)}%` }}
                          transition={{ delay: 0.4, duration: 0.8, ease: premium }}
                          className="h-full rounded-full bg-amber"
                        />
                      </div>
                      <span className="text-xs text-text-muted font-ui w-4 text-right">{val as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Pianeti — lista espandibile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, ease: premium }}
          className="mb-5"
        >
          <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-3 px-1">I TUOI PIANETI</div>
          <div className="space-y-2">
            {planets.map((p) => {
              const sign = profile[p.key as keyof Profile] as string | undefined;
              if (!sign) return null;
              const isOpen = expanded === p.key;

              return (
                <motion.div key={p.key} layout>
                  <button
                    onClick={() => setExpanded(isOpen ? null : p.key)}
                    className={`w-full glass rounded-xl p-4 text-left transition-all duration-300 ${
                      isOpen ? "glow border border-amber/15" : "hover:border-amber/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-lg ${isOpen ? "text-amber" : "text-text-muted"}`}
                          dangerouslySetInnerHTML={{ __html: p.symbol }}
                        />
                        <div>
                          <span className="text-sm font-bold font-display">{p.name}</span>
                          <span className="text-amber text-sm ml-2 font-body">{sign}</span>
                        </div>
                      </div>
                      <span className={`text-text-muted text-xs transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                        &#9662;
                      </span>
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
        </motion.div>

        {/* Aspetti critici */}
        {profile.natalChartData?.criticalAspects && profile.natalChartData.criticalAspects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, ease: premium }}
            className="glass rounded-2xl p-5 mb-5 dimensional"
          >
            <div className="text-[10px] text-sienna font-ui tracking-[0.2em] mb-3">ASPETTI CRITICI</div>
            <div className="space-y-2">
              {profile.natalChartData.criticalAspects.map((asp, i) => (
                <div key={i} className="text-sm text-text-secondary font-body flex items-start gap-2">
                  <span className="text-sienna shrink-0">&#10038;</span>
                  <span>{asp}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mappa dell'Ombra */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, ease: premium }}
          className="glass rounded-2xl p-5 mb-5 dimensional border border-sienna/10"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-sienna font-ui tracking-[0.2em]">&#9681; MAPPA DELL&apos;OMBRA</div>
            <button
              onClick={() => setShowShadows(!showShadows)}
              className="text-[10px] text-amber font-ui tracking-wide"
            >
              {showShadows ? "Nascondi" : "Rivela"}
            </button>
          </div>
          {profile.shadowMapNarrative && (
            <p className={`text-text-secondary font-body italic leading-relaxed mb-4 transition-all duration-500 ${
              showShadows ? "" : "curiosity-blur"
            }`}>
              {profile.shadowMapNarrative}
            </p>
          )}
          <div className={`space-y-3 transition-all duration-500 ${showShadows ? "" : "curiosity-blur"}`}>
            {profile.shadows?.map((s, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-bg-glass">
                <span className="text-sienna text-lg shrink-0">&#9681;</span>
                <div>
                  <div className="text-sm font-bold font-display text-text-primary mb-0.5">{s}</div>
                  <div className="text-xs text-text-muted font-body">L&apos;ombra che nasconde un dono</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* La Tua Mitologia */}
        {profile.mythologyNarrative && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, ease: premium }}
            className="glass rounded-2xl p-6 mb-5 dimensional glow border border-amber/10"
          >
            <div className="text-[10px] text-amber font-ui tracking-[0.2em] mb-4">&#9670; LA TUA MITOLOGIA</div>
            <p className="text-text-primary font-body italic leading-relaxed text-lg">
              &ldquo;{profile.mythologyNarrative}&rdquo;
            </p>
          </motion.div>
        )}

        {/* Profilo di consapevolezza */}
        {profile.personalitySummary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, ease: premium }}
            className="glass rounded-2xl p-5 mb-5 dimensional"
          >
            <div className="text-[10px] text-verdigris font-ui tracking-[0.2em] mb-3">LO SPECCHIO COSMICO</div>
            <p className="text-text-secondary font-body leading-relaxed italic">{profile.personalitySummary}</p>
            {profile.awarenessScore != null && profile.awarenessScore > 0 && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-text-muted font-ui tracking-wide">CONSAPEVOLEZZA</span>
                  <span className="text-xs text-amber font-bold font-ui">{profile.awarenessScore}%</span>
                </div>
                <div className="h-1.5 bg-bg-surface rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${profile.awarenessScore}%` }}
                    transition={{ delay: 0.5, duration: 1, ease: premium }}
                    className="h-full rounded-full bg-gradient-to-r from-verdigris to-amber"
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Doni e Valori */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, ease: premium }}
          className="grid grid-cols-2 gap-3 mb-5"
        >
          <div className="glass rounded-2xl p-4 dimensional">
            <div className="text-[10px] text-amber font-ui tracking-[0.2em] mb-3">DONI</div>
            <div className="space-y-2">
              {profile.strengths?.map((s, i) => (
                <div key={i} className="text-sm text-text-secondary font-body flex items-start gap-2">
                  <span className="text-amber shrink-0">&#9670;</span><span>{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-4 dimensional">
            <div className="text-[10px] text-verdigris font-ui tracking-[0.2em] mb-3">VALORI</div>
            <div className="space-y-2">
              {profile.values?.map((v, i) => (
                <div key={i} className="text-sm text-text-secondary font-body flex items-start gap-2">
                  <span className="text-verdigris shrink-0">&#10038;</span><span>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
