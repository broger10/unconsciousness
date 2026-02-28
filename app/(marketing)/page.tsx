"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

/* Premium deceleration curve — objects that land naturally */
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
  visible: { transition: { staggerChildren: 0.06 } },
};

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);

  return (
    <div className="relative overflow-hidden">
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="fixed inset-0 alchemy-bg pointer-events-none opacity-40" />

      {/* Hero — scroll-linked parallax */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-amber/5 blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-verdigris/4 blur-[120px]" />

        <motion.div
          className="text-center max-w-4xl mx-auto relative z-10"
          style={{ opacity: heroOpacity, y: heroY }}
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="mb-8">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-sm text-amber font-ui dimensional">
              <span className="w-2 h-2 rounded-full bg-amber ember-pulse" />
              Cosmic AI Engine
            </span>
          </motion.div>

          <motion.h1
            variants={scaleIn}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8"
          >
            <span className="block text-text-primary">Le stelle</span>
            <span className="block text-gradient">ti conoscono</span>
            <span className="block text-text-muted text-3xl md:text-5xl lg:text-6xl font-body italic mt-4">
              meglio di te.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-body"
          >
            L&apos;unica app che combina astrologia profonda e intelligenza artificiale
            per mostrarti chi sei davvero — le tue ombre, i tuoi doni nascosti,
            il tuo destino cosmico.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-10 py-6 breathe dimensional">
                Scopri il tuo cielo
              </Button>
            </Link>
            <a href="#come-funziona">
              <Button size="lg" variant="ghost" className="text-lg px-10 py-6">
                Come funziona
              </Button>
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-6 text-text-muted text-sm font-ui"
          >
            <span className="flex items-center gap-2">
              <span className="text-verdigris">&#9670;</span> I tuoi dati sono solo tuoi
            </span>
            <span className="flex items-center gap-2">
              <span className="text-amber">&#9670;</span> Zero tracking, zero SDK di terze parti
            </span>
            <span className="flex items-center gap-2">
              <span className="text-sienna">&#9670;</span> AI di nuova generazione
            </span>
          </motion.div>
        </motion.div>
      </section>

      {/* Social proof + Stats */}
      <section className="relative py-20 px-6">
        <motion.div
          className="max-w-5xl mx-auto"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
        >
          <motion.div variants={fadeUp} className="text-center mb-12">
            <p className="text-text-muted text-sm font-ui tracking-wider">PERCH&Eacute; QUESTO &Egrave; DIVERSO</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n: "95%", l: "non conosce le proprie ombre", s: "Jung, L'Inconscio" },
              { n: "120M", l: "cercano risposte nelle stelle", s: "utenti attivi globali" },
              { n: "0", l: "app con vera AI astrologica", s: "fino ad oggi" },
            ].map((x) => (
              <motion.div key={x.l} variants={fadeUp} className="text-center glass rounded-2xl p-8 dimensional">
                <div className="text-4xl md:text-5xl font-bold font-display text-gradient mb-2">{x.n}</div>
                <div className="text-text-secondary font-body text-lg mb-1">{x.l}</div>
                <div className="text-text-muted text-xs font-ui tracking-wider">{x.s}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <motion.div className="max-w-6xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4">
              Non un oroscopo. <br /><span className="text-gradient">Uno specchio alchemico.</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto font-body">
              Un&apos;intelligenza artificiale che legge il tuo cielo e ti mostra ci&ograve; che nessun astrologo ha mai potuto dirti.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: "&#9790;", c: "text-amber", bc: "border-amber/10 from-amber/6 to-verdigris/3", t: "Il Tuo Tema Natale", s: "Decodificato dall'AI", d: "Non il solito oroscopo. Un'analisi radicalmente specifica del tuo cielo. Ogni parola scritta solo per te." },
              { icon: "&#9681;", c: "text-sienna", bc: "border-sienna/10 from-sienna/6 to-amber/3", t: "La Mappa dell'Ombra", s: "Ci\u00f2 che non vedi di te", d: "Le ferite pi\u00f9 profonde contengono i doni nascosti pi\u00f9 grandi. L'AI li porta alla luce." },
              { icon: "&#9672;", c: "text-verdigris", bc: "border-verdigris/10 from-verdigris/6 to-amber/3", t: "Tre Visioni del Destino", s: "Il tuo futuro, triplicato", d: "Tre percorsi cosmici costruiti sul tuo cielo. Profezie personalizzate che si avverano." },
              { icon: "&#10038;", c: "text-amber-glow", bc: "border-amber-glow/10 from-amber-glow/5 to-sienna/3", t: "L'Oracolo Quotidiano", s: "Il cosmo ti parla ogni giorno", d: "Un agente AI che monitora i tuoi transiti e rivela ci\u00f2 che le stelle muovono nella tua vita." },
            ].map((f) => (
              <motion.div key={f.t} variants={fadeUp} className={`group rounded-2xl p-8 border bg-gradient-to-br ${f.bc} hover:glow transition-all duration-500 dimensional`}>
                <div className={`text-4xl mb-4 ${f.c}`} dangerouslySetInnerHTML={{ __html: f.icon }} />
                <div className={`${f.c} text-[10px] font-bold font-ui tracking-[0.2em] mb-2`}>{f.s.toUpperCase()}</div>
                <h3 className="text-xl font-bold font-display mb-3">{f.t}</h3>
                <p className="text-text-secondary leading-relaxed font-body text-lg">{f.d}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Curiosity teaser */}
      <section className="relative py-16 px-6">
        <motion.div
          className="max-w-3xl mx-auto glass rounded-2xl p-10 text-center dimensional"
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, ease: premium }}
        >
          <div className="text-5xl mb-4 text-amber breathe">&#9670;</div>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
            &ldquo;Il 73% degli Scorpione non sa qual &egrave; <span className="text-gradient">la propria ferita nascosta</span>&rdquo;
          </h3>
          <p className="text-text-muted font-body text-lg mb-6 curiosity-blur">
            Basato sull&apos;analisi di migliaia di temi natali, la combinazione Sole-Chirone nello Scorpione rivela un pattern di autosabotaggio che...
          </p>
          <Link href="/login">
            <Button variant="secondary" className="font-ui">Scopri il tuo pattern nascosto</Button>
          </Link>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="come-funziona" className="relative py-24 px-6">
        <motion.div className="max-w-4xl mx-auto" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              Tre passi verso la <br /><span className="text-gradient">consapevolezza cosmica</span>
            </h2>
          </motion.div>
          <div className="space-y-6">
            {[
              { n: "I", t: "Inserisci la tua nascita", d: "Data, ora e luogo. Il tuo cielo si apre. Pi\u00f9 precisi sono i dati, pi\u00f9 profondo \u00e8 lo specchio." },
              { n: "II", t: "L'AI ti esplora", d: "10 domande che penetrano l'inconscio. Nessuna app ti ha mai fatto queste domande. Le tue ombre emergono." },
              { n: "III", t: "Lo specchio si accende", d: "Tema natale, mappa dell'ombra, visioni del destino. Parole che non hai mai letto su di te." },
            ].map((s, i) => (
              <motion.div key={s.n} variants={fadeUp} className="flex gap-6 items-start glass rounded-2xl p-8 dimensional group hover:border-amber/10 transition-all duration-500">
                <div className="text-3xl font-display font-bold text-amber/30 shrink-0 group-hover:text-amber/60 transition-colors">{s.n}</div>
                <div>
                  <h3 className="text-xl font-bold font-display mb-2">{s.t}</h3>
                  <p className="text-text-secondary font-body text-lg">{s.d}</p>
                </div>
                <div className="ml-auto shrink-0 text-text-muted/30 text-2xl group-hover:text-amber/40 transition-colors">&#8594;</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Privacy */}
      <section className="relative py-24 px-6">
        <motion.div className="max-w-4xl mx-auto text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp}>
            <div className="text-4xl mb-6 text-verdigris">&#9670;</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Le tue stelle sono <span className="text-gradient">solo tue</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8 font-body">
              Zero tracker. Zero SDK di terze parti. I tuoi dati non vengono mai venduti, condivisi o analizzati da terzi. Mai.
              Ogni insight resta tra te e il tuo cielo.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {["Crittografia end-to-end", "Zero cookie di profilazione", "Server europei", "GDPR compliant"].map((p) => (
                <span key={p} className="glass rounded-full px-4 py-2 text-xs text-verdigris font-ui">&#9670; {p}</span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[600px] h-[600px] rounded-full bg-amber/5 blur-[200px]" />
        </div>
        <motion.div className="max-w-3xl mx-auto text-center relative z-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={scaleIn} className="font-display text-4xl md:text-6xl font-bold mb-6">
            Sei pronta a vedere <br /><span className="text-gradient">chi sei davvero?</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="text-text-secondary text-lg mb-10 font-body">
            Il tuo cielo ti sta aspettando. L&apos;AI &egrave; pronta a leggerlo. Bastano 3 minuti.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/login">
              <Button size="lg" className="text-lg px-12 py-6 breathe dimensional">Inizia il viaggio</Button>
            </Link>
            <p className="mt-4 text-text-muted text-xs font-ui">Gratuito durante la beta &#183; Nessuna carta richiesta</p>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
