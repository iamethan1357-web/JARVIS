"use client";

import { useEffect, useState, useCallback } from "react";

interface Automation {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  createdAt: string;
}

export default function AutomationsView() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", trigger: "", action: "" });

  const loadAutomations = useCallback(() => {
    fetch("/api/automations")
      .then((r) => r.json())
      .then((data) => {
        setAutomations(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => { loadAutomations(); }, [loadAutomations]);

  const createAutomation = async () => {
    if (!formData.name.trim() || !formData.trigger.trim() || !formData.action.trim()) return;
    await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ name: "", trigger: "", action: "" });
    setShowForm(false);
    loadAutomations();
  };

  const toggleActive = async (automation: Automation) => {
    await fetch("/api/automations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...automation, active: !automation.active }),
    });
    loadAutomations();
  };

  const deleteAutomation = async (id: string) => {
    await fetch(`/api/automations?id=${id}`, { method: "DELETE" });
    loadAutomations();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border border-jarvis-blue mx-auto mb-3 animate-arc-reactor" />
          <p className="text-jarvis-text-dim text-xs font-mono">Loading automation protocols...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-jarvis-text">Automation Protocols</h2>
          <p className="text-xs text-jarvis-text-dim mt-1">
            {automations.filter(a => a.active).length} active of {automations.length} total
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-jarvis-blue/20 border border-jarvis-blue/40 text-jarvis-blue rounded-lg text-sm hover:bg-jarvis-blue/30 transition-all"
        >
          + New Protocol
        </button>
      </div>

      {showForm && (
        <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-jarvis-blue uppercase tracking-wider">Define Protocol</h3>
          <input
            type="text"
            placeholder="Protocol name..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text placeholder-jarvis-text-dim/50 focus:outline-none focus:border-jarvis-blue/50"
          />
          <input
            type="text"
            placeholder="Trigger condition (e.g., 'When I arrive home')..."
            value={formData.trigger}
            onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
            className="w-full bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text placeholder-jarvis-text-dim/50 focus:outline-none focus:border-jarvis-blue/50"
          />
          <input
            type="text"
            placeholder="Action (e.g., 'Turn on lights, set thermostat to 72°F')..."
            value={formData.action}
            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
            className="w-full bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text placeholder-jarvis-text-dim/50 focus:outline-none focus:border-jarvis-blue/50"
          />
          <div className="flex gap-2">
            <button
              onClick={createAutomation}
              className="px-4 py-2 bg-jarvis-blue text-jarvis-bg rounded-lg text-sm font-medium hover:bg-jarvis-cyan transition-colors"
            >
              Deploy Protocol
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-jarvis-text-dim hover:text-jarvis-text text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Automations List */}
      <div className="space-y-3">
        {automations.length === 0 ? (
          <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-8 text-center">
            <p className="text-jarvis-text-dim text-sm">No automation protocols configured, Sir.</p>
          </div>
        ) : (
          automations.map((automation) => (
            <div
              key={automation.id}
              className={`bg-jarvis-panel border rounded-xl p-5 transition-all group ${
                automation.active
                  ? "border-jarvis-border/40 hover:border-jarvis-blue/30"
                  : "border-jarvis-border/20 opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleActive(automation)}
                  className={`w-11 h-6 rounded-full relative transition-colors shrink-0 mt-0.5 ${
                    automation.active ? "bg-jarvis-blue" : "bg-jarvis-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      automation.active ? "left-[22px]" : "left-0.5"
                    }`}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-jarvis-text flex items-center gap-2">
                    <span>⚡</span>
                    {automation.name}
                  </h4>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-jarvis-gold/10 text-jarvis-gold shrink-0 mt-0.5">
                        WHEN
                      </span>
                      <span className="text-xs text-jarvis-text-dim">{automation.trigger}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-jarvis-green/10 text-jarvis-green shrink-0 mt-0.5">
                        THEN
                      </span>
                      <span className="text-xs text-jarvis-text-dim">{automation.action}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteAutomation(automation.id)}
                  className="text-jarvis-text-dim/40 hover:text-jarvis-red transition-colors opacity-0 group-hover:opacity-100 text-sm shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
