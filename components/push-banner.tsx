"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkle } from "lucide-react";

const premium = [0.16, 1, 0.3, 1] as const;

export function PushBanner() {
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed, already subscribed, or not supported
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (localStorage.getItem("push-dismissed") === "true") return;
    if (Notification.permission === "granted") {
      setSubscribed(true);
      return;
    }
    if (Notification.permission === "denied") return;

    // Show after a small delay (after first horoscope loads)
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleActivate = async () => {
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register("/sw.js");

      // Get VAPID key
      const res = await fetch("/api/push/subscribe");
      const { vapidPublicKey } = await res.json();

      if (!vapidPublicKey) {
        setShow(false);
        return;
      }

      // Request permission and subscribe
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        localStorage.setItem("push-dismissed", "true");
        setShow(false);
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      // Send subscription to server
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      setSubscribed(true);
      setShow(false);
    } catch {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("push-dismissed", "true");
    setShow(false);
  };

  if (subscribed || !show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ ease: premium }}
        className="glass rounded-2xl p-4 mb-5 dimensional border border-amber/10"
      >
        <div className="flex items-start gap-3">
          <Sparkle size={18} className="text-amber shrink-0 ember-pulse" />
          <div className="flex-1">
            <p className="text-sm font-bold font-display text-text-primary mb-0.5">
              Ricevi il tuo cielo ogni mattina
            </p>
            <p className="text-xs text-text-muted font-ui mb-3">
              Un messaggio personalizzato dalle stelle, ogni giorno alle 8:00
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleActivate}
                className="px-4 py-1.5 rounded-lg text-xs font-ui bg-amber text-bg-base dimensional hover:glow transition-all"
              >
                Attiva
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-1.5 rounded-lg text-xs font-ui text-text-muted hover:text-text-secondary transition-colors"
              >
                Non ora
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer as ArrayBuffer;
}
