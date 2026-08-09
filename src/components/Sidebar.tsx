"use client";

import type { View } from "@/app/page";

const navItems: { id: View; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "chat", label: "JARVIS Chat", icon: "💬" },
  { id: "tasks", label: "Tasks", icon: "🎯" },
  { id: "notes", label: "Memory Bank", icon: "🧠" },
  { id: "reminders", label: "Reminders", icon: "⏰" },
  { id: "smarthome", label: "Smart Home", icon: "🏠" },
  { id: "automations", label: "Automations", icon: "⚡" },
];

export default function Sidebar({
  currentView,
  onNavigate,
}: {
  currentView: View;
  onNavigate: (v: View) => void;
}) {
  return (
    <aside className="hidden md:flex w-64 flex-col bg-jarvis-panel border-r border-jarvis-border/50 h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-jarvis-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-jarvis-blue flex items-center justify-center animate-arc-reactor bg-jarvis-blue/10">
            <span className="text-jarvis-blue font-bold text-sm font-mono">J</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider text-jarvis-blue" style={{ fontFamily: "var(--font-mono)" }}>
              J.A.R.V.I.S.
            </h1>
            <p className="text-[10px] text-jarvis-text-dim tracking-[0.2em] uppercase">
              Operational AI
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
              currentView === item.id
                ? "bg-jarvis-blue/15 text-jarvis-blue border border-jarvis-blue/30 shadow-[0_0_15px_rgba(0,180,216,0.1)]"
                : "text-jarvis-text-dim hover:text-jarvis-text hover:bg-jarvis-panel-light border border-transparent"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Install & Deploy */}
      <div className="p-3 border-t border-jarvis-border/50 space-y-1">
        <a
          href="/deploy"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-jarvis-text-dim hover:text-jarvis-blue hover:bg-jarvis-blue/10 border border-transparent hover:border-jarvis-blue/30 transition-all"
        >
          <span className="text-lg">🚀</span>
          <span className="font-medium">Deploy</span>
        </a>
        <a
          href="/install"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-jarvis-text-dim hover:text-jarvis-blue hover:bg-jarvis-blue/10 border border-transparent hover:border-jarvis-blue/30 transition-all"
        >
          <span className="text-lg">📲</span>
          <span className="font-medium">Install APK</span>
        </a>
      </div>

      {/* System Status */}
      <div className="p-4 border-t border-jarvis-border/50">
        <div className="flex items-center gap-2 text-xs text-jarvis-text-dim">
          <span className="w-2 h-2 rounded-full bg-jarvis-green animate-pulse" />
          <span>All Systems Nominal</span>
        </div>
        <div className="mt-2 text-[10px] text-jarvis-text-dim/60 font-mono">
          v3.7.1 // STARK INDUSTRIES
        </div>
      </div>
    </aside>
  );
}
