"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const premium = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: premium } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: premium } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const signs = [
  "Ariete", "Toro", "Gemelli", "Cancro", "Leone", "Vergine",
  "Bilancia", "Scorpione", "Sagittario", "Capricorno", "Acquario", "Pesci",
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -80]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const [demoSign, setDemoSign] = useState("");
  const [demoResult, setDemoResult] = useState("");
  const [demoLoading, setDemoLoading] = useState(false);

  const demoMessages: Record<string, string> = {
    Ariete: "La fiamma che brucia dentro di te non \u00e8 impazienza \u2014 \u00e8 il ricordo di ci\u00f2 che eri prima di imparare la paura. Marte ti chiede di smettere di correre e di guardare cosa stai fuggendo.",
    Toro: "Il tuo bisogno di sicurezza nasconde una verit\u00e0 che non vuoi vedere: la vita pi\u00f9 bella che puoi avere \u00e8 quella che non puoi controllare. Venere ti sussurra: lascia andare la presa.",
    Gemelli: "Due voci parlano dentro di te e nessuna \u00e8 quella vera. La persona che cerchi di essere cambia con chi hai davanti. Mercurio ti sfida: resta ferma abbastanza a lungo da sentirti.",
    Cancro: "Proteggi tutti tranne te stessa. La Luna rivela: il guscio che hai costruito tiene fuori l\u2019amore tanto quanto il dolore. Chi ti ha insegnato che la vulnerabilit\u00e0 \u00e8 debolezza?",
    Leone: "Il palcoscenico che cerchi fuori esiste perch\u00e9 dentro c\u2019\u00e8 un bambino che non \u00e8 mai stato visto abbastanza. Il Sole ti chiede: saresti ancora tu senza gli applausi?",
    Vergine: "L\u2019ordine che imponi al mondo \u00e8 il riflesso del caos che non tolleri dentro. Mercurio rivela: la perfezione che cerchi \u00e8 il modo in cui eviti l\u2019imperfezione di essere umana.",
    Bilancia: "L\u2019armonia che crei per gli altri \u00e8 il prezzo che paghi per non affrontare il conflitto con te stessa. Venere ti chiede: cosa vuoi TU, senza chiedere il permesso a nessuno?",
    Scorpione: "Sai tutto di tutti ma non lasci che nessuno sappia tutto di te. Plutone rivela: il controllo \u00e8 la tua armatura preferita. Cosa succederebbe se la togliessi?",
    Sagittario: "La libert\u00e0 che cerchi in ogni viaggio \u00e8 la fuga dal posto in cui dovresti restare. Giove ti sfida: la prossima avventura \u00e8 fermarti.",
    Capricorno: "Hai scalato cos\u00ec in alto che hai dimenticato perch\u00e9 hai iniziato. Saturno rivela: il successo senza significato \u00e8 la prigione pi\u00f9 elegante che esista.",
    Acquario: "La distanza emotiva che chiami indipendenza \u00e8 il modo in cui proteggi un cuore pi\u00f9 fragile di quanto ammetti. Urano ti chiede: puoi essere rivoluzionaria E vulnerabile?",
    Pesci: "Senti tutto di tutti e non sai pi\u00f9 cosa \u00e8 tuo. Nettuno rivela: la compassione infinita \u00e8 bella, ma dove finisci tu e iniziano gli altri?",
  };

  const tryDemo = (sign: string) => {
    setDemoSign(sign);
    setDemoLoading(true);
    setDemoResult("");
    setTimeout(() => {
      setDemoResult(demoMessages[sign] || "");
      setDemoLoading(false);
    }, 1500);
  };

  return (
    <div className="relative overflow-hidden">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="fixed inset-0 alchemy-bg pointer-events-none opacity-40" />

      {/* ==================== HERO ==================== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-amber/5 blur-[200px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-verdigris/4 blur-[150px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-sienna/3 blur-[120px]" />

        <motion.div
          className="text-center max-w-4xl mx-auto relative z-10"
          style={{ opacity: heroOpacity, y: heroY, scale: heroScale }}
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-8">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-xs text-amber font-ui dimensional tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber ember-pulse" />
              PRIMA APP AI ASTROLOGICA IN ITALIA
            </span>
          </motion.div>

          <motion.h1
            variants={scaleIn}
            className="font-display text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[0.88] mb-8"
          >
            <span className="block text-text-primary">Le stelle</span>
            <span className="block text-text-primary">ti conoscono</span>
            <span className="block text-gradient text-4xl md:text-6xl lg:text-7xl mt-2 font-body italic">
              meglio di te.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-text-secondary max-w-xl mx-auto mb-10 leading-relaxed font-body"
          >
            Astrologia profonda + AI di nuova generazione.
            Scopri le tue ombre, i tuoi doni nascosti, il destino scritto nel tuo cielo.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-10 py-7 breathe dimensional font-display">
                Scopri il tuo cielo
              </Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="ghost" className="text-lg px-10 py-7 font-ui">
                Provalo gratis &#8595;
              </Button>
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-text-muted text-xs font-ui"
          >
            <span className="flex items-center gap-1.5">
              <span className="text-verdigris">&#9670;</span> Zero tracking
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-amber">&#9670;</span> AI Claude di Anthropic
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-sienna">&#9670;</span> Gratuito in beta
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* ==================== SOCIAL PROOF ==================== */}
      <section className="relative py-20 px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-4">
            <p className="text-text-muted text-[10px] font-ui tracking-[0.3em]">I NUMERI NON MENTONO</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: "$4.75B", l: "Il mercato dell'astrologia nel 2025", s: "Grand View Research" },
              { n: "120M+", l: "Utenti attivi nelle app astrologiche", s: "Co-Star, The Pattern, Nebula" },
              { n: "0", l: "App con vera AI astrologica in Italia", s: "Fino ad oggi" },
            ].map((x) => (
              <motion.div key={x.l} variants={fadeUp} className="text-center glass rounded-2xl p-8 dimensional">
                <div className="text-4xl md:text-5xl font-bold font-display text-gradient mb-2">{x.n}</div>
                <div className="text-text-secondary font-body text-base mb-1">{x.l}</div>
                <div className="text-text-muted text-[10px] font-ui tracking-wider">{x.s}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ==================== DEMO INTERATTIVA ==================== */}
      <section id="demo" className="relative py-24 px-6">
        <motion.div
          className="max-w-3xl mx-auto"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Prova. <span className="text-gradient">Senza registrarti.</span>
            </h2>
            <p className="text-text-secondary font-body text-lg max-w-lg mx-auto">
              Scegli il tuo segno e ricevi un assaggio di ci&ograve; che l&apos;oracolo vede. Questo &egrave; solo l&apos;1% di quello che ti aspetta.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="glass rounded-2xl p-8 dimensional">
            <div className="text-[10px] text-text-muted font-ui tracking-[0.2em] mb-4">SCEGLI IL TUO SEGNO SOLARE</div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-6">
              {signs.map((s) => (
                <button
                  key={s}
                  onClick={() => tryDemo(s)}
                  className={`rounded-xl py-2.5 px-2 text-xs font-ui transition-all duration-300 ${
                    demoSign === s
                      ? "glass glow text-amber border border-amber/20"
                      : "bg-bg-surface text-text-muted hover:text-amber hover:bg-bg-card"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {demoLoading && (
              <div className="flex items-center gap-3 py-8 justify-center">
                <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-amber/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-text-muted text-sm font-ui ml-2">L&apos;oracolo ti osserva...</span>
              </div>
            )}

            {demoResult && !demoLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ease: premium }}
              >
                <div className="border-l-2 border-amber/30 pl-5 py-2 mb-6">
                  <p className="text-text-primary font-body italic text-lg leading-relaxed">
                    &ldquo;{demoResult}&rdquo;
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-text-muted text-xs font-ui mb-4">
                    Questo &egrave; solo il segno solare. Con il tema natale completo, l&apos;oracolo vede <span className="text-amber">10 volte</span> pi&ugrave; in profondit&agrave;.
                  </p>
                  <Link href="/login">
                    <Button className="dimensional">Scopri il tuo tema completo</Button>
                  </Link>
                </div>
              </motion.div>
            )}

            {!demoSign && !demoLoading && (
              <div className="text-center py-8">
                <span className="text-3xl text-text-muted/30">&#10038;</span>
                <p className="text-text-muted text-sm font-body mt-2 italic">Scegli un segno per ricevere il tuo messaggio</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      </section>

      {/* ==================== FEATURES — IL DIFFERENZIATORE ==================== */}
      <section className="relative py-24 px-6">
        <motion.div className="max-w-6xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-amber text-[10px] font-ui tracking-[0.3em] mb-4">COSA PUOI FARE</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Non un oroscopo. <br /><span className="text-gradient">Uno specchio cosmico.</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto font-body">
              Sei funzioni che nessun&apos;altra app al mondo ti offre. Ognuna costruita con AI di nuova generazione.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "&#9788;", c: "text-amber", bc: "border-amber/10 from-amber/6 to-verdigris/2", t: "Tema Natale AI", d: "10 pianeti decodificati. Non un elenco di segni \u2014 una radiografia della tua anima scritta solo per te." },
              { icon: "&#9681;", c: "text-sienna", bc: "border-sienna/10 from-sienna/6 to-amber/2", t: "Mappa dell'Ombra", d: "Le ferite junghiane nascoste nel tuo cielo. I punti ciechi che sabotano la tua vita. I doni che contengono." },
              { icon: "&#10038;", c: "text-amber-glow", bc: "border-amber-glow/10 from-amber-glow/5 to-verdigris/2", t: "Oracolo AI", d: "Una chat con un'intelligenza che conosce il tuo cielo, il tuo umore, i tuoi pattern. Ti risponde come nessuno ha mai fatto." },
              { icon: "&#9670;", c: "text-amber", bc: "border-amber/10 from-amber/5 to-sienna/2", t: "Oroscopo Quotidiano", d: "Ogni mattina, 3 righe scritte SOLO per il tuo tema natale. Niente Barnum effect. Solo verit\u00e0 che ti riconosci." },
              { icon: "&#9790;", c: "text-verdigris", bc: "border-verdigris/10 from-verdigris/6 to-amber/2", t: "Diario Cosmico", d: "Scrivi. L'AI riflette ci\u00f2 che non vedi. Ogni entry diventa uno specchio che rivela i tuoi pattern inconsci." },
              { icon: "&#9672;", c: "text-verdigris", bc: "border-verdigris/10 from-verdigris/5 to-sienna/2", t: "Tre Visioni del Destino", d: "Tre futuri possibili costruiti sul tuo cielo. Profezie personalizzate con timeline astrologiche reali." },
            ].map((f) => (
              <motion.div
                key={f.t}
                variants={fadeUp}
                className={`group rounded-2xl p-7 border bg-gradient-to-br ${f.bc} hover:glow transition-all duration-500 dimensional`}
              >
                <div className={`text-3xl mb-3 ${f.c} group-hover:scale-110 transition-transform duration-300`} dangerouslySetInnerHTML={{ __html: f.icon }} />
                <h3 className="text-base font-bold font-display mb-2">{f.t}</h3>
                <p className="text-text-secondary leading-relaxed font-body text-sm">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ==================== CURIOSITY TEASER ==================== */}
      <section className="relative py-16 px-6">
        <motion.div
          className="max-w-3xl mx-auto glass rounded-2xl p-10 md:p-14 text-center dimensional border border-amber/5"
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease: premium }}
        >
          <div className="text-5xl mb-5 text-amber breathe">&#9670;</div>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Il 73% delle persone non conosce <span className="text-gradient">la propria ferita nascosta</span>
          </h3>
          <p className="text-text-secondary font-body text-lg mb-2">
            La posizione di Chirone nel tuo tema natale rivela la ferita pi&ugrave; profonda che porti &mdash; e il dono pi&ugrave; grande che contiene.
          </p>
          <p className="text-text-muted font-body text-base mb-6 curiosity-blur">
            Quando Chirone si trova in aspetto con il tuo Sole, crea un pattern di autosabotaggio che si manifesta specialmente nelle relazioni intime. La persona tende a...
          </p>
          <Link href="/login">
            <Button className="dimensional font-ui">Scopri la tua ferita cosmica</Button>
          </Link>
        </motion.div>
      </section>

      {/* ==================== COME FUNZIONA ==================== */}
      <section id="come-funziona" className="relative py-24 px-6">
        <motion.div className="max-w-4xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <p className="text-amber text-[10px] font-ui tracking-[0.3em] mb-4">IL PERCORSO</p>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              Tre minuti per aprire <br /><span className="text-gradient">il tuo portale cosmico</span>
            </h2>
          </motion.div>
          <div className="space-y-5">
            {[
              { n: "01", t: "Inserisci la tua nascita", d: "Data, ora, luogo. L'AI calcola le posizioni reali dei 10 pianeti nel momento esatto in cui sei venuta/o al mondo.", icon: "&#9788;" },
              { n: "02", t: "L'oracolo ti esplora", d: "10 domande che nessuno ti ha mai fatto. Domande che penetrano l'inconscio e rivelano ci\u00f2 che non sai di te.", icon: "&#9681;" },
              { n: "03", t: "Lo specchio si accende", d: "Tema natale, mappa dell'ombra, mitologia personale, visioni del destino. Parole scritte solo per te, per sempre.", icon: "&#9670;" },
            ].map((s) => (
              <motion.div
                key={s.n}
                variants={fadeUp}
                className="flex gap-5 md:gap-8 items-start glass rounded-2xl p-6 md:p-8 dimensional group hover:border-amber/10 transition-all duration-500"
              >
                <div className="shrink-0 w-12 h-12 rounded-xl bg-bg-surface flex items-center justify-center group-hover:bg-amber/10 transition-colors">
                  <span className="text-amber text-lg" dangerouslySetInnerHTML={{ __html: s.icon }} />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-text-muted font-ui tracking-wider mb-1">PASSO {s.n}</div>
                  <h3 className="text-lg font-bold font-display mb-1.5">{s.t}</h3>
                  <p className="text-text-secondary font-body text-sm leading-relaxed">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ==================== CONFRONTO ==================== */}
      <section className="relative py-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Perch&eacute; non &egrave; <span className="text-gradient">un&apos;altra app di oroscopi</span>
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} className="glass rounded-2xl p-6 md:p-8 dimensional overflow-hidden">
            <div className="grid grid-cols-3 gap-4 text-center mb-6">
              <div />
              <div className="text-[10px] text-text-muted font-ui tracking-wider">ALTRE APP</div>
              <div className="text-[10px] text-amber font-ui tracking-wider">UNCONSCIOUSNESS</div>
            </div>
            {[
              { label: "Oroscopo", other: "Generico, copia-incolla", us: "AI + tema natale completo" },
              { label: "Personalizzazione", other: "Solo segno solare", us: "10 pianeti + psicologia" },
              { label: "Ombre e ferite", other: "Non esistono", us: "Mappa junghiana completa" },
              { label: "Chat AI", other: "Chatbot generico", us: "Oracolo con il TUO cielo" },
              { label: "Privacy", other: "Vendita dati", us: "Zero tracking, zero ads" },
              { label: "Profondit\u00e0", other: "Intrattenimento", us: "Trasformazione reale" },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-3 gap-4 py-3 border-t border-border/30 items-center">
                <div className="text-xs font-ui text-text-primary font-bold">{row.label}</div>
                <div className="text-xs font-body text-text-muted text-center">{row.other}</div>
                <div className="text-xs font-body text-amber text-center">{row.us}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ==================== PRIVACY ==================== */}
      <section className="relative py-20 px-6">
        <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp}>
            <div className="text-4xl mb-6 text-verdigris">&#9670;</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Le tue stelle sono <span className="text-gradient">solo tue</span>
            </h2>
            <p className="text-text-secondary text-base max-w-xl mx-auto mb-8 font-body">
              Non vendiamo dati. Non usiamo tracker. Non facciamo pubblicit&agrave;. I tuoi insight restano tra te e il tuo cielo. Per sempre.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Crittografia end-to-end", "Zero cookie di profilazione", "Server europei", "GDPR compliant", "Nessun SDK di terze parti"].map((p) => (
                <span key={p} className="glass rounded-full px-4 py-2 text-xs text-verdigris font-ui dimensional">&#9670; {p}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ==================== CTA FINALE ==================== */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[700px] h-[700px] rounded-full bg-amber/5 blur-[250px]" />
        </div>
        <motion.div className="max-w-3xl mx-auto text-center relative z-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={scaleIn} className="text-6xl text-amber mb-8 breathe">&#9670;</motion.div>
          <motion.h2 variants={scaleIn} className="font-display text-4xl md:text-6xl font-bold mb-6">
            Il tuo cielo <br /><span className="text-gradient">ti sta aspettando</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-text-secondary text-lg mb-10 font-body max-w-md mx-auto">
            Tre minuti per scoprire ci&ograve; che le stelle hanno scritto per te. L&apos;AI &egrave; pronta. Sei pronta/o tu?
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/login">
              <Button size="lg" className="text-lg px-14 py-7 breathe dimensional font-display">
                Inizia il viaggio cosmico
              </Button>
            </Link>
            <p className="mt-5 text-text-muted text-xs font-ui">Gratuito durante la beta &#183; Nessuna carta richiesta &#183; 3 minuti</p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
