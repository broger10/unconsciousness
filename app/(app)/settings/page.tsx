"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold font-display mb-8 text-gradient">Il Tuo Cielo</h1>

        <div className="space-y-4">
          <Card variant="glass">
            <h3 className="font-semibold font-display mb-2">Account</h3>
            <p className="text-text-muted text-sm font-body mb-4">
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
            <h3 className="font-semibold font-display mb-2">Privacy</h3>
            <p className="text-text-muted text-sm font-body">
              I tuoi dati sono criptati e sicuri. Non condividiamo nulla con terze parti. Mai.
            </p>
          </Card>

          <Card variant="glass">
            <h3 className="font-semibold font-display mb-2">Piano</h3>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg bg-amber/10 text-amber text-sm border border-amber/20 font-ui">
                Free
              </span>
              <span className="text-text-muted text-sm font-body">
                Accesso completo durante la beta
              </span>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
