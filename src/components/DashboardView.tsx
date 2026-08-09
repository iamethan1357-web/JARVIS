"use client";

import { useEffect, useState } from "react";
import type { View } from "@/app/page";

interface Stats {
  tasks: { total: number; pending: number; inProgress: number; completed: number };
  notes: { total: number };
  reminders: { total: number; active: number };
  devices: { total: number; active: number };
  automations: { total: number; active: number };
  systemTime: string;
  systemStatus: string;
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  color,
  onClick,
}: {
  icon: string;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left w-full bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-5 hover:border-jarvis-blue/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,180,216,0.1)] group`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-jarvis-text-dim uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-3xl font-bold font-mono ${color}`}>{value}</p>
          {subtitle && (
            <p className="text-xs text-jarvis-text-dim mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity">{icon}</span>
      </div>
    </button>
  );
}

export default function DashboardView({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-jarvis-blue mx-auto mb-4 animate-arc-reactor flex items-center justify-center">
            <span className="text-jarvis-blue font-bold text-xl font-mono">J</span>
          </div>
          <p className="text-jarvis-text-dim text-sm font-mono">Initializing systems...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-jarvis-red text-center p-8">System diagnostics failed. Please retry, Sir.</div>;
  }

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-jarvis-blue/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <p className="text-xs text-jarvis-text-dim uppercase tracking-[0.2em] font-mono mb-2">
            System Status: <span className="text-jarvis-green">Operational</span>
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-jarvis-text">
            {greeting}, <span className="text-jarvis-blue">Sir</span>.
          </h1>
          <p className="text-jarvis-text-dim mt-2 text-sm max-w-xl">
            All systems are online and awaiting your command. I&apos;ve prepared a comprehensive overview of your operational environment.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🎯"
          label="Pending Tasks"
          value={stats.tasks.pending}
          subtitle={`${stats.tasks.completed} completed`}
          color="text-jarvis-gold"
          onClick={() => onNavigate("tasks")}
        />
        <StatCard
          icon="🧠"
          label="Memory Entries"
          value={stats.notes.total}
          subtitle="Notes stored"
          color="text-jarvis-purple"
          onClick={() => onNavigate("notes")}
        />
        <StatCard
          icon="🏠"
          label="Active Devices"
          value={`${stats.devices.active}/${stats.devices.total}`}
          subtitle="Smart home"
          color="text-jarvis-cyan"
          onClick={() => onNavigate("smarthome")}
        />
        <StatCard
          icon="⚡"
          label="Automations"
          value={stats.automations.active}
          subtitle={`${stats.automations.total} total protocols`}
          color="text-jarvis-green"
          onClick={() => onNavigate("automations")}
        />
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Task Overview */}
        <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-jarvis-text uppercase tracking-wider">Task Distribution</h3>
            <button onClick={() => onNavigate("tasks")} className="text-xs text-jarvis-blue hover:underline">View All →</button>
          </div>
          <div className="space-y-3">
            <TaskBar label="Pending" value={stats.tasks.pending} total={stats.tasks.total || 1} color="bg-jarvis-gold" />
            <TaskBar label="In Progress" value={stats.tasks.inProgress} total={stats.tasks.total || 1} color="bg-jarvis-blue" />
            <TaskBar label="Completed" value={stats.tasks.completed} total={stats.tasks.total || 1} color="bg-jarvis-green" />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-jarvis-text uppercase tracking-wider mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickAction icon="💬" label="Talk to JARVIS" onClick={() => onNavigate("chat")} />
            <QuickAction icon="🎯" label="New Task" onClick={() => onNavigate("tasks")} />
            <QuickAction icon="📝" label="Quick Note" onClick={() => onNavigate("notes")} />
            <QuickAction icon="⏰" label="Set Reminder" onClick={() => onNavigate("reminders")} />
          </div>
        </div>
      </div>

      {/* System metrics */}
      <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-jarvis-text uppercase tracking-wider mb-4">System Diagnostics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricItem label="Core Temp" value="42°C" status="normal" />
          <MetricItem label="Memory" value="67%" status="normal" />
          <MetricItem label="Network" value="1.2 Gbps" status="normal" />
          <MetricItem label="Uptime" value="99.97%" status="normal" />
        </div>
      </div>
    </div>
  );
}

function TaskBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-jarvis-text-dim">{label}</span>
        <span className="text-jarvis-text font-mono">{value} ({pct}%)</span>
      </div>
      <div className="h-2 bg-jarvis-bg rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-jarvis-panel-light border border-jarvis-border/30 rounded-lg hover:border-jarvis-blue/40 transition-all text-sm text-jarvis-text-dim hover:text-jarvis-text"
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function MetricItem({ label, value, status }: { label: string; value: string; status: string }) {
  return (
    <div className="text-center p-3 bg-jarvis-bg/50 rounded-lg border border-jarvis-border/20">
      <p className="text-xs text-jarvis-text-dim mb-1">{label}</p>
      <p className="text-lg font-mono font-bold text-jarvis-blue">{value}</p>
      <p className={`text-[10px] uppercase tracking-wider mt-1 ${status === "normal" ? "text-jarvis-green" : "text-jarvis-red"}`}>
        {status}
      </p>
    </div>
  );
}
