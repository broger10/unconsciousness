"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-8">Impostazioni</h1>

        <div className="space-y-4">
          <Card variant="glass">
            <h3 className="font-semibold mb-2">Account</h3>
            <p className="text-text-muted text-sm mb-4">
              Gestisci il tuo account e i dati personali.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Esci
            </Button>
          </Card>

          <Card variant="glass">
            <h3 className="font-semibold mb-2">Dati</h3>
            <p className="text-text-muted text-sm">
              I tuoi dati sono criptati e sicuri. Non condividiamo nulla con terze parti.
            </p>
          </Card>

          <Card variant="glass">
            <h3 className="font-semibold mb-2">Piano</h3>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-accent/10 text-accent text-sm border border-accent/20">
                Free
              </span>
              <span className="text-text-muted text-sm">
                Funzionalità complete durante la beta
              </span>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
