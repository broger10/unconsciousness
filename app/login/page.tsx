"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent-glow/5 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <Link href="/" className="text-2xl font-bold tracking-tight inline-block mb-6">
            <span className="text-gradient">un</span>
            <span className="text-text-primary">consciousness</span>
          </Link>
          <h1 className="text-3xl font-bold mb-3">Inizia il viaggio</h1>
          <p className="text-text-secondary">
            Scopri chi sei davvero. L&apos;AI ti aspetta.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-4">
          <Button
            variant="secondary"
            size="lg"
            className="w-full justify-center gap-3"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continua con Google
          </Button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-bg-primary px-4 text-text-muted">oppure</span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const email = new FormData(e.currentTarget).get("email") as string;
              signIn("email", { email, callbackUrl: "/dashboard" });
            }}
            className="space-y-4"
          >
            <input
              name="email"
              type="email"
              placeholder="La tua email"
              className="w-full px-4 py-3 rounded-xl bg-bg-secondary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-all"
              required
            />
            <Button type="submit" size="lg" className="w-full justify-center">
              Continua con email
            </Button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-6">
          Continuando, accetti i{" "}
          <Link href="#" className="text-accent hover:underline">
            Termini
          </Link>{" "}
          e la{" "}
          <Link href="#" className="text-accent hover:underline">
            Privacy Policy
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
