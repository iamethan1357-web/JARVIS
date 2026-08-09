"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function NotificationSetup() {
  const { permission, isSupported, isEnabled, requestPermission } = useNotifications();
  const [showBanner, setShowBanner] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  // Check if app is installed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      setIsInstalled(isStandalone);
    }
  }, []);

  // Capture install prompt
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Show banner after a short delay if not enabled
  useEffect(() => {
    if (!isSupported) return;
    if (isEnabled && isInstalled) return;

    // Check if user dismissed banner recently
    const dismissed = localStorage.getItem("jarvis-banner-dismissed");
    if (dismissed) {
      const dismissedAt = parseInt(dismissed);
      // Don't show for 24 hours after dismissal
      if (Date.now() - dismissedAt < 24 * 60 * 60 * 1000) return;
    }

    const timer = setTimeout(() => setShowBanner(true), 3000);
    return () => clearTimeout(timer);
  }, [isSupported, isEnabled, isInstalled]);

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowBanner(false);
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("jarvis-banner-dismissed", Date.now().toString());
  };

  if (!showBanner) return null;

  const needsNotifications = !isEnabled && permission !== "denied";
  const canInstall = !!installPrompt && !isInstalled;

  if (!needsNotifications && !canInstall) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-fade-in">
      <div className="bg-jarvis-panel border border-jarvis-blue/30 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,180,216,0.15)]">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full border border-jarvis-blue/50 flex items-center justify-center bg-jarvis-blue/10 shrink-0">
            <span className="text-jarvis-blue font-bold text-sm font-mono">J</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-jarvis-text mb-1">
              {canInstall ? "Install JARVIS" : "Enable Notifications"}
            </p>
            <p className="text-xs text-jarvis-text-dim leading-relaxed">
              {canInstall
                ? "Install JARVIS as an app for quick access and background reminders, Sir."
                : "Allow notifications so I can alert you when reminders are due, Sir."}
            </p>
            <div className="flex gap-2 mt-3">
              {canInstall && (
                <button
                  onClick={handleInstall}
                  className="px-3 py-1.5 bg-jarvis-blue text-jarvis-bg rounded-lg text-xs font-medium hover:bg-jarvis-cyan transition-colors"
                >
                  Install App
                </button>
              )}
              {needsNotifications && (
                <button
                  onClick={handleEnableNotifications}
                  className="px-3 py-1.5 bg-jarvis-blue/20 border border-jarvis-blue/40 text-jarvis-blue rounded-lg text-xs font-medium hover:bg-jarvis-blue/30 transition-colors"
                >
                  Enable Alerts
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-jarvis-text-dim hover:text-jarvis-text text-xs transition-colors"
              >
                Later
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-jarvis-text-dim/50 hover:text-jarvis-text-dim text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
