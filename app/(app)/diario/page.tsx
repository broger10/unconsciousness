"use client";

import { useEffect, useState, useCallback } from "react";
import { SchermataInizio } from "@/components/specchio/schermata-inizio";
import { SchermataSceltaCapitolo } from "@/components/specchio/schermata-scelta-capitolo";
import { SessioneGiornaliera } from "@/components/specchio/sessione-giornaliera";
import { SchermataFineSessione } from "@/components/specchio/schermata-fine-sessione";
import { SchermataRitratto } from "@/components/specchio/schermata-ritratto";
import { SchermataRiposa } from "@/components/specchio/schermata-riposa";
import { Compass } from "lucide-react";
import { motion } from "framer-motion";

type Schermata =
  | "loading"
  | "inizio"
  | "scelta"
  | "sessione"
  | "fine-sessione"
  | "ritratto"
  | "riposa";

interface CapitoloAttivo {
  id: string;
  slug: string;
  giornoCorrente: number;
  ritratto?: string | null;
  ritrattoInsights?: string[];
}

interface CapitoloCompletato {
  slug: string;
  ritratto?: string | null;
  ritrattoInsights?: string[];
}

interface Consiglio {
  slug: string;
  motivazione: string;
}

export default function DiarioPage() {
  const [schermata, setSchermata] = useState<Schermata>("loading");
  const [capitoloAttivo, setCapitoloAttivo] = useState<CapitoloAttivo | null>(null);
  const [capitoliCompletati, setCapitoliCompletati] = useState<CapitoloCompletato[]>([]);
  const [consigli, setConsigli] = useState<Consiglio[]>([]);
  const [consigliLoading, setConsigliLoading] = useState(false);
  const [sessioneFeedback, setSessioneFeedback] = useState("");
  const [sessioneIsUltimo, setSessioneIsUltimo] = useState(false);
  // For viewing a portrait of a just-completed chapter
  const [ritrattoCapitoloId, setRitrattoCapitoloId] = useState<string | null>(null);
  const [ritrattoSlug, setRitrattoSlug] = useState<string | null>(null);

  // Load state on mount
  const loadStato = useCallback(async () => {
    try {
      const res = await fetch("/api/specchio/stato");
      const data = await res.json();

      setCapitoliCompletati(data.capitoliCompletati || []);

      if (data.maiIniziato) {
        setSchermata("inizio");
        return;
      }

      if (data.capitoloAttivo) {
        setCapitoloAttivo(data.capitoloAttivo);
        if (data.sessioneOggiCompletata) {
          setSchermata("riposa");
        } else {
          setSchermata("sessione");
        }
        return;
      }

      if (data.capitoloAppenaCompletato) {
        // Chapter just completed — show portrait
        const ultimo = data.capitoliCompletati[0];
        if (ultimo?.ritratto) {
          setRitrattoSlug(ultimo.slug);
          setSchermata("ritratto");
        } else {
          // Need to generate portrait — find the chapter
          fetchConsigliAndShow();
        }
        return;
      }

      // No active chapter, not just completed — show choice
      fetchConsigliAndShow();
    } catch {
      setSchermata("inizio");
    }
  }, []);

  useEffect(() => {
    loadStato();
  }, [loadStato]);

  const fetchConsigliAndShow = async () => {
    setConsigliLoading(true);
    setSchermata("scelta");
    try {
      const res = await fetch("/api/specchio/consiglia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setConsigli(data.consigli || []);
    } catch {
      setConsigli([]);
    }
    setConsigliLoading(false);
  };

  const handleStartFromInizio = () => {
    fetchConsigliAndShow();
  };

  const handleSelectCapitolo = async (slug: string) => {
    setConsigliLoading(true);
    try {
      const res = await fetch("/api/specchio/consiglia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (data.capitoloId) {
        setCapitoloAttivo({
          id: data.capitoloId,
          slug: data.slug,
          giornoCorrente: 1,
        });
        setSchermata("sessione");
      }
    } catch {
      // Stay on choice screen
    }
    setConsigliLoading(false);
  };

  const handleSessioneComplete = (feedback: string, isUltimo: boolean) => {
    setSessioneFeedback(feedback);
    setSessioneIsUltimo(isUltimo);
    setSchermata("fine-sessione");
  };

  const handleFineSessioneContinua = () => {
    if (sessioneIsUltimo && capitoloAttivo) {
      setRitrattoCapitoloId(capitoloAttivo.id);
      setRitrattoSlug(capitoloAttivo.slug);
      setCapitoloAttivo(null);
      setSchermata("ritratto");
    } else {
      // Go to rest screen until tomorrow
      setSchermata("riposa");
    }
  };

  const handleRitrattoContinua = () => {
    setRitrattoCapitoloId(null);
    setRitrattoSlug(null);
    fetchConsigliAndShow();
  };

  const handleVediUltimoRitratto = () => {
    const ultimo = capitoliCompletati[0];
    if (ultimo) {
      setRitrattoSlug(ultimo.slug);
      setSchermata("ritratto");
    }
  };

  // Loading
  if (schermata === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
          <Compass size={36} className="text-amber ember-pulse mb-4" />
          <p className="text-text-muted text-sm font-ui">Carico lo specchio...</p>
        </motion.div>
      </div>
    );
  }

  // First time
  if (schermata === "inizio") {
    return <SchermataInizio onStart={handleStartFromInizio} />;
  }

  // Choice between chapters
  if (schermata === "scelta") {
    return (
      <SchermataSceltaCapitolo
        consigli={consigli}
        loading={consigliLoading}
        onSelect={handleSelectCapitolo}
      />
    );
  }

  // Daily session
  if (schermata === "sessione" && capitoloAttivo) {
    return (
      <SessioneGiornaliera
        capitoloId={capitoloAttivo.id}
        capitoloSlug={capitoloAttivo.slug}
        giorno={capitoloAttivo.giornoCorrente}
        onComplete={handleSessioneComplete}
      />
    );
  }

  // Session complete feedback
  if (schermata === "fine-sessione") {
    return (
      <SchermataFineSessione
        feedback={sessioneFeedback}
        isUltimoGiorno={sessioneIsUltimo}
        onContinua={handleFineSessioneContinua}
      />
    );
  }

  // Portrait
  if (schermata === "ritratto" && ritrattoSlug) {
    const completed = capitoliCompletati.find((c) => c.slug === ritrattoSlug);
    return (
      <SchermataRitratto
        capitoloId={ritrattoCapitoloId || ""}
        capitoloSlug={ritrattoSlug}
        ritratto={completed?.ritratto}
        insights={completed?.ritrattoInsights}
        onContinua={handleRitrattoContinua}
      />
    );
  }

  // Rest (already completed today)
  if (schermata === "riposa") {
    return (
      <SchermataRiposa
        haRitratto={capitoliCompletati.length > 0 && !!capitoliCompletati[0]?.ritratto}
        onVediRitratto={handleVediUltimoRitratto}
      />
    );
  }

  return null;
}
