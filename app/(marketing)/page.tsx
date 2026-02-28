"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const features = [
  {
    icon: "🌙",
    title: "Il Tuo Tema Natale",
    subtitle: "Decodificato dall'AI",
    description:
      "Non il solito oroscopo. Un'analisi radicalmente specifica del tuo cielo di nascita. Ogni parola scritta solo per te.",
  },
  {
    icon: "🪞",
    title: "La Mappa dell'Ombra",
    subtitle: "Ciò che non vedi di te",
    description:
      "Il tuo tema natale contiene le tue ferite più profonde — e i doni nascosti al loro interno. L'AI li porta alla luce.",
  },
  {
    icon: "🔮",
    title: "Tre Visioni del Destino",
    subtitle: "Il tuo futuro, triplicato",
    description:
      "Tre percorsi cosmici costruiti sul tuo cielo. Non previsioni — profezie personalizzate che si avverano.",
  },
  {
    icon: "✨",
    title: "L'Oracolo Quotidiano",
    subtitle: "Il cosmo ti parla ogni giorno",
    description:
      "Un agente AI che monitora i tuoi transiti e ti rivela ciò che le stelle stanno muovendo nella tua vita. Ogni. Singolo. Giorno.",
  },
];

const steps = [
  {
    number: "01",
    title: "Inserisci la tua nascita",
    description: "Data, ora e luogo. Il tuo cielo si apre.",
  },
  {
    number: "02",
    title: "L'AI ti esplora",
    description: "10 domande che penetrano l'inconscio. Le tue ombre emergono.",
  },
  {
    number: "03",
    title: "Lo specchio si accende",
    description: "Tema natale, mappa dell'ombra, insight cosmici. Non sarai più la stessa persona.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Cosmic background effects */}
      <div className="fixed inset-0 cosmic-gradient pointer-events-none" />
      <div className="fixed inset-0 stars-bg pointer-events-none opacity-30" />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent-glow/5 blur-[120px]" />

        <motion.div
          className="text-center max-w-4xl mx-auto relative z-10"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-accent">
              <span className="w-2 h-2 rounded-full bg-accent glow-pulse" />
              Powered by Cosmic AI
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8"
          >
            <span className="block">Le stelle</span>
            <span className="block text-gradient-cosmic">ti conoscono</span>
            <span className="block text-text-secondary text-3xl md:text-5xl lg:text-6xl font-light mt-4">
              meglio di te.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            L&apos;unica app che combina astrologia profonda e intelligenza artificiale
            per mostrarti chi sei davvero — le tue ombre, i tuoi doni nascosti,
            il tuo destino cosmico.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="text-lg px-10 py-6 cosmic-breathe">
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
            variants={fadeInUp}
            className="mt-12 flex items-center justify-center gap-8 text-text-muted text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-accent">🔒</span>
              <span>I tuoi dati sono solo tuoi</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-accent">✦</span>
              <span>Zero tracking. Zero pubblicità</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Social proof */}
      <section className="relative py-20 px-6">
        <motion.div
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          {[
            { number: "95%", label: "non conosce le proprie ombre", sub: "Jung, Psicologia dell'Inconscio" },
            { number: "120M", label: "cercano risposte nelle stelle", sub: "Utenti attivi globali" },
            { number: "0", label: "app con vera AI astrologica", sub: "fino ad oggi" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={fadeInUp} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gradient-cosmic mb-2">{stat.number}</div>
              <div className="text-text-secondary mb-1">{stat.label}</div>
              <div className="text-text-muted text-sm">{stat.sub}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <motion.div
          className="max-w-6xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Non un oroscopo.
              <br />
              <span className="text-gradient-cosmic">Uno specchio cosmico.</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Un&apos;intelligenza artificiale che legge il tuo cielo di nascita e ti mostra
              ciò che nessun astrologo ha mai potuto dirti.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={fadeInUp}
                className="group glass rounded-2xl p-8 hover:border-accent/20 transition-all duration-500 hover:glow cursor-default"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <div className="text-accent text-sm font-medium mb-1">{feature.subtitle}</div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-gradient-cosmic transition-all">
                  {feature.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="come-funziona" className="relative py-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Tre passi verso la
              <br />
              <span className="text-gradient-cosmic">consapevolezza cosmica</span>
            </h2>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step) => (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="flex gap-6 items-start glass rounded-2xl p-8"
              >
                <div className="text-4xl font-bold text-accent/30 font-mono shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-text-secondary">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Privacy section */}
      <section className="relative py-24 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div variants={fadeInUp}>
            <div className="text-5xl mb-6">🔒</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Le tue stelle sono <span className="text-gradient-cosmic">solo tue</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
              Zero tracker. Zero Facebook SDK. Zero pubblicità. I tuoi dati di nascita,
              le tue ombre, i tuoi segreti cosmici non vengono mai condivisi, venduti
              o usati per profilarti. Mai.
            </p>
            <div className="inline-flex flex-wrap items-center justify-center gap-6 glass rounded-full px-8 py-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success">✓</span>
                <span className="text-text-secondary">Crittografia end-to-end</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success">✓</span>
                <span className="text-text-secondary">Zero third-party</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-success">✓</span>
                <span className="text-text-secondary">GDPR compliant</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[500px] h-[500px] rounded-full bg-accent-glow/10 blur-[150px]" />
        </div>

        <motion.div
          className="max-w-3xl mx-auto text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Sei pronta a vedere
            <br />
            <span className="text-gradient-cosmic">chi sei davvero?</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-text-secondary text-lg mb-10">
            Il tuo cielo ti sta aspettando. L&apos;AI è pronta a leggerlo.
            <br />
            Il primo passo è il più luminoso.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <Link href="/login">
              <Button size="lg" className="text-lg px-12 py-6 cosmic-breathe">
                Inizia il viaggio cosmico
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
