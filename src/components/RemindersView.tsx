"use client";

import { useEffect, useState, useCallback } from "react";
import { useNotifications } from "@/hooks/useNotifications";

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  remindAt: string;
  recurring: string | null;
  active: boolean;
  createdAt: string;
}

export default function RemindersView() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    remindAt: "",
    recurring: "",
  });

  const { 
    permission, 
    isSupported, 
    isEnabled, 
    requestPermission, 
    showNotification,
    clearNotifiedReminder 
  } = useNotifications();

  const loadReminders = useCallback(() => {
    fetch("/api/reminders")
      .then((r) => r.json())
      .then((data) => {
        setReminders(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => { loadReminders(); }, [loadReminders]);

  const createReminder = async () => {
    if (!formData.title.trim() || !formData.remindAt) return;
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        recurring: formData.recurring || null,
      }),
    });
    const newReminder = await res.json();
    clearNotifiedReminder(newReminder.id);
    setFormData({ title: "", description: "", remindAt: "", recurring: "" });
    setShowForm(false);
    loadReminders();
  };

  const toggleActive = async (reminder: Reminder) => {
    await fetch("/api/reminders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...reminder, active: !reminder.active }),
    });
    loadReminders();
  };

  const deleteReminder = async (id: string) => {
    await fetch(`/api/reminders?id=${id}`, { method: "DELETE" });
    loadReminders();
  };

  const testNotification = async () => {
    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) return;
    }
    await showNotification("⏰ JARVIS Test Reminder", {
      body: "This is a test notification, Sir. Your reminder system is operational.",
      tag: "test-notification",
    });
  };

  const isPast = (dateStr: string) => new Date(dateStr) < new Date();
  const isUpcoming = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - Date.now();
    return diff > 0 && diff < 60 * 60 * 1000; // Within next hour
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border border-jarvis-blue mx-auto mb-3 animate-arc-reactor" />
          <p className="text-jarvis-text-dim text-xs font-mono">Loading temporal alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-jarvis-text">Temporal Alerts</h2>
          <p className="text-xs text-jarvis-text-dim mt-1">
            {reminders.filter(r => r.active).length} active reminders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-jarvis-blue/20 border border-jarvis-blue/40 text-jarvis-blue rounded-lg text-sm hover:bg-jarvis-blue/30 transition-all"
          >
            + New Reminder
          </button>
        </div>
      </div>

      {/* Notification Status Banner */}
      {isSupported && (
        <div className={`rounded-xl p-4 border ${
          isEnabled 
            ? "bg-jarvis-green/10 border-jarvis-green/30" 
            : permission === "denied"
            ? "bg-jarvis-red/10 border-jarvis-red/30"
            : "bg-jarvis-gold/10 border-jarvis-gold/30"
        }`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {isEnabled ? "🔔" : permission === "denied" ? "🔕" : "🔔"}
              </span>
              <div>
                <p className={`text-sm font-medium ${
                  isEnabled ? "text-jarvis-green" : permission === "denied" ? "text-jarvis-red" : "text-jarvis-gold"
                }`}>
                  {isEnabled 
                    ? "Notifications Enabled" 
                    : permission === "denied"
                    ? "Notifications Blocked"
                    : "Enable Notifications"}
                </p>
                <p className="text-xs text-jarvis-text-dim">
                  {isEnabled 
                    ? "I'll alert you when reminders are due, Sir." 
                    : permission === "denied"
                    ? "Please enable notifications in your browser settings."
                    : "Allow notifications to receive reminder alerts."}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {isEnabled && (
                <button
                  onClick={testNotification}
                  className="px-3 py-1.5 text-xs border border-jarvis-green/40 text-jarvis-green rounded-lg hover:bg-jarvis-green/10 transition-colors"
                >
                  Test Alert
                </button>
              )}
              {!isEnabled && permission !== "denied" && (
                <button
                  onClick={requestPermission}
                  className="px-3 py-1.5 text-xs bg-jarvis-gold/20 border border-jarvis-gold/40 text-jarvis-gold rounded-lg hover:bg-jarvis-gold/30 transition-colors"
                >
                  Enable Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-jarvis-blue uppercase tracking-wider">Set Temporal Alert</h3>
          <input
            type="text"
            placeholder="Reminder title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text placeholder-jarvis-text-dim/50 focus:outline-none focus:border-jarvis-blue/50"
          />
          <input
            type="text"
            placeholder="Description (optional)..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text placeholder-jarvis-text-dim/50 focus:outline-none focus:border-jarvis-blue/50"
          />
          <div className="flex gap-3 flex-wrap">
            <input
              type="datetime-local"
              value={formData.remindAt}
              onChange={(e) => setFormData({ ...formData, remindAt: e.target.value })}
              className="bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-blue/50"
            />
            <select
              value={formData.recurring}
              onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
              className="bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-blue/50"
            >
              <option value="">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={createReminder}
              className="px-4 py-2 bg-jarvis-blue text-jarvis-bg rounded-lg text-sm font-medium hover:bg-jarvis-cyan transition-colors"
            >
              Set Alert
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

      {/* Reminders List */}
      <div className="space-y-2">
        {reminders.length === 0 ? (
          <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-8 text-center">
            <p className="text-jarvis-text-dim text-sm">No temporal alerts configured, Sir.</p>
            <p className="text-jarvis-text-dim/60 text-xs mt-2">
              Create a reminder and I&apos;ll notify you when it&apos;s due.
            </p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`bg-jarvis-panel border rounded-xl p-4 transition-all group ${
                !reminder.active ? "opacity-50 border-jarvis-border/20" :
                isPast(reminder.remindAt) ? "border-jarvis-red/40 bg-jarvis-red/5" : 
                isUpcoming(reminder.remindAt) ? "border-jarvis-gold/40 bg-jarvis-gold/5" :
                "border-jarvis-border/40 hover:border-jarvis-blue/30"
              }`}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => toggleActive(reminder)}
                  className={`w-10 h-6 rounded-full relative transition-colors ${
                    reminder.active ? "bg-jarvis-blue" : "bg-jarvis-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      reminder.active ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-jarvis-text">{reminder.title}</span>
                    {reminder.recurring && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-jarvis-purple/20 text-jarvis-purple">
                        🔄 {reminder.recurring}
                      </span>
                    )}
                    {isPast(reminder.remindAt) && reminder.active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-jarvis-red/20 text-jarvis-red animate-pulse">
                        ⚠️ OVERDUE
                      </span>
                    )}
                    {isUpcoming(reminder.remindAt) && reminder.active && !isPast(reminder.remindAt) && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-jarvis-gold/20 text-jarvis-gold">
                        ⏰ SOON
                      </span>
                    )}
                  </div>
                  {reminder.description && (
                    <p className="text-xs text-jarvis-text-dim mt-1">{reminder.description}</p>
                  )}
                  <p className="text-xs text-jarvis-text-dim mt-1 font-mono">
                    ⏰ {new Date(reminder.remindAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteReminder(reminder.id)}
                  className="text-jarvis-text-dim/40 hover:text-jarvis-red transition-colors opacity-0 group-hover:opacity-100 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* PWA Install Hint */}
      {isSupported && isEnabled && (
        <div className="bg-jarvis-panel-light border border-jarvis-border/20 rounded-xl p-4 text-center">
          <p className="text-xs text-jarvis-text-dim">
            💡 Tip: Install JARVIS as an app on your device for the best reminder experience.
            <br />
            <span className="text-jarvis-text-dim/60">
              On mobile: tap the share button → &quot;Add to Home Screen&quot;
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
