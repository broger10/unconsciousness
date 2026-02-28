"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const features = [
  {
    icon: "🪞",
    title: "Lo Specchio",
    description:
      "L'AI analizza chi sei realmente, non chi pensi di essere. Scopri i tuoi punti ciechi.",
  },
  {
    icon: "🔮",
    title: "Tre Visioni",
    description:
      "Per ogni decisione, 3 futuri personalizzati. Ognuno costruito su misura per i tuoi valori.",
  },
  {
    icon: "⚡",
    title: "Il Rituale",
    description:
      "5 minuti al giorno. L'AI impara i tuoi pattern e rivela ciò che non vedi.",
  },
];

const steps = [
  {
    number: "01",
    title: "La Scoperta",
    description:
      "Una conversazione profonda con l'AI. Non un test — un'esplorazione di chi sei.",
  },
  {
    number: "02",
    title: "Lo Specchio",
    description:
      "Vedi il tuo profilo di consapevolezza: punti di forza, punti ciechi, valori nascosti.",
  },
  {
    number: "03",
    title: "Le Visioni",
    description:
      "Descrivi un obiettivo. L'AI crea 3 futuri possibili, ognuno perfetto per te.",
  },
];

const stats = [
  { value: "95%", label: "delle persone crede di essere consapevole" },
  { value: "10%", label: "lo è realmente" },
  { value: "3", label: "visioni per ogni decisione" },
];

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-glow/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-[120px]" />
      </div>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium glass text-accent">
              Il tuo specchio comportamentale AI
            </span>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
          >
            Vedi te stesso.
            <br />
            <span className="text-gradient">Con chiarezza.</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Il 95% delle persone crede di conoscersi. Solo il 10% ci riesce davvero.
            Unconsciousness usa l&apos;AI per mostrarti chi sei realmente, illuminare
            la tua strada e convincerti che la scelta giusta è già dentro di te.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/login">
              <Button size="lg" className="text-lg px-10">
                Inizia la scoperta
              </Button>
            </Link>
            <Link href="#come-funziona">
              <Button variant="ghost" size="lg" className="text-lg">
                Come funziona
              </Button>
            </Link>
          </motion.div>

          {/* Floating orbs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 2 }}
            className="mt-20 flex justify-center gap-8"
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 rounded-full bg-accent/40 float"
                style={{ animationDelay: `${i * 0.8}s` }}
              />
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative py-20 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="text-5xl md:text-6xl font-bold text-gradient mb-2">
                {stat.value}
              </div>
              <div className="text-text-secondary text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Non un&apos;altra app di meditazione.
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              Unconsciousness non ti dice cosa fare. Ti mostra chi sei. La differenza
              è tutto.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeInUp} transition={{ duration: 0.6 }}>
                <Card
                  variant="glass"
                  className="h-full hover:border-accent/20 transition-all duration-500 group"
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section id="come-funziona" className="relative py-24 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Come funziona
            </h2>
            <p className="text-text-secondary text-lg">
              Tre passi verso la chiarezza totale.
            </p>
          </motion.div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Card variant="glass" className="flex items-start gap-6 hover:border-accent/20 transition-all duration-500">
                  <div className="text-3xl font-bold text-accent font-mono shrink-0">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-text-secondary leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-3xl mx-auto text-center"
        >
          <motion.div
            variants={fadeInUp}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-accent-glow/10 rounded-3xl blur-[60px]" />
            <Card variant="glass" className="relative p-12 md:p-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Sei pronto a vedere
                <br />
                <span className="text-gradient">chi sei davvero?</span>
              </h2>
              <p className="text-text-secondary text-lg mb-8 max-w-lg mx-auto">
                La consapevolezza non è un lusso. È il sistema operativo di ogni
                decisione che prendi. Inizia oggi.
              </p>
              <Link href="/login">
                <Button size="lg" className="text-lg px-12">
                  Inizia gratis
                </Button>
              </Link>
              <p className="text-text-muted text-xs mt-4">
                Nessuna carta di credito richiesta
              </p>
            </Card>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
