"use client";

import { useEffect, useState } from "react";
import type { View } from "@/app/page";

const viewTitles: Record<View, string> = {
  dashboard: "Command Center",
  chat: "J.A.R.V.I.S. Interface",
  tasks: "Task Management",
  notes: "Memory Bank",
  reminders: "Temporal Alerts",
  smarthome: "Smart Home Control",
  automations: "Automation Protocols",
};

export default function TopBar({
  currentView,
  onNavigate,
}: {
  currentView: View;
  onNavigate: (v: View) => void;
}) {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-jarvis-border/50 bg-jarvis-panel/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-jarvis-text-dim hover:text-jarvis-blue transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-full border border-jarvis-blue flex items-center justify-center animate-arc-reactor bg-jarvis-blue/10">
              <span className="text-jarvis-blue font-bold text-xs font-mono">J</span>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-jarvis-text tracking-wide">
              {viewTitles[currentView]}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-jarvis-text-dim">
            <span className="text-xs">{date}</span>
            <span className="text-jarvis-border">|</span>
            <span className="text-xs font-mono text-jarvis-blue">{time}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-jarvis-green" />
            <span className="text-xs text-jarvis-green font-mono hidden sm:inline">ONLINE</span>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <nav
            className="absolute left-0 top-0 h-full w-64 bg-jarvis-panel border-r border-jarvis-border/50 p-4 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 mb-4 border-b border-jarvis-border/50">
              <div className="w-8 h-8 rounded-full border border-jarvis-blue flex items-center justify-center animate-arc-reactor bg-jarvis-blue/10">
                <span className="text-jarvis-blue font-bold text-xs font-mono">J</span>
              </div>
              <span className="text-jarvis-blue font-bold font-mono tracking-wider">J.A.R.V.I.S.</span>
            </div>
            {(["dashboard", "chat", "tasks", "notes", "reminders", "smarthome", "automations"] as View[]).map(
              (view) => (
                <button
                  key={view}
                  onClick={() => {
                    onNavigate(view);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all ${
                    currentView === view
                      ? "bg-jarvis-blue/15 text-jarvis-blue"
                      : "text-jarvis-text-dim hover:text-jarvis-text hover:bg-jarvis-panel-light"
                  }`}
                >
                  {viewTitles[view]}
                </button>
              )
            )}
          </nav>
        </div>
      )}
    </>
  );
}
