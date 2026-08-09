"use client";

import { useState } from "react";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

export default function VoiceSettings() {
  const {
    settings,
    updateSettings,
    preview,
    stop,
    isSpeaking,
    getEnglishVoices,
    getJarvisVoice,
  } = useSpeechSynthesis();

  const [isOpen, setIsOpen] = useState(false);
  const englishVoices = getEnglishVoices();
  const currentVoice = getJarvisVoice();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-lg border border-jarvis-border/30 text-jarvis-text-dim hover:text-jarvis-blue hover:border-jarvis-blue/30 transition-all text-xs"
        title="Voice Settings"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-jarvis-panel border border-jarvis-blue/30 rounded-2xl p-6 max-w-md w-full shadow-[0_0_40px_rgba(0,180,216,0.15)] animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-jarvis-text">Voice Configuration</h3>
            <p className="text-[10px] text-jarvis-text-dim mt-0.5">
              Customize JARVIS voice output
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-jarvis-text-dim hover:text-jarvis-text transition-colors text-lg"
          >
            ×
          </button>
        </div>

        <div className="space-y-5">
          {/* Current Voice */}
          <div>
            <label className="text-xs text-jarvis-text-dim uppercase tracking-wider mb-2 block">
              Voice
            </label>
            <select
              value={settings.voiceName || ""}
              onChange={(e) => updateSettings({ voiceName: e.target.value || null })}
              className="w-full bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-3 py-2.5 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-blue/50"
            >
              <option value="">Auto-select (deep male)</option>
              {englishVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            {currentVoice && (
              <p className="text-[10px] text-jarvis-blue mt-1 font-mono">
                Active: {currentVoice.name}
              </p>
            )}
          </div>

          {/* Pitch — Deep/Bass control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-jarvis-text-dim uppercase tracking-wider">
                Pitch (Depth)
              </label>
              <span className="text-xs font-mono text-jarvis-blue">{settings.pitch.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.2"
              step="0.05"
              value={settings.pitch}
              onChange={(e) => updateSettings({ pitch: parseFloat(e.target.value) })}
              className="w-full h-2 bg-jarvis-border rounded-full appearance-none cursor-pointer accent-jarvis-blue"
            />
            <div className="flex justify-between text-[9px] text-jarvis-text-dim mt-1">
              <span>🔊 Ultra Deep</span>
              <span>Normal</span>
              <span>High ⬆️</span>
            </div>
          </div>

          {/* Rate — Speed control */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-jarvis-text-dim uppercase tracking-wider">
                Speed
              </label>
              <span className="text-xs font-mono text-jarvis-blue">{settings.rate.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.rate}
              onChange={(e) => updateSettings({ rate: parseFloat(e.target.value) })}
              className="w-full h-2 bg-jarvis-border rounded-full appearance-none cursor-pointer accent-jarvis-blue"
            />
            <div className="flex justify-between text-[9px] text-jarvis-text-dim mt-1">
              <span>🐢 Slow</span>
              <span>Normal</span>
              <span>Fast 🐇</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div>
            <label className="text-xs text-jarvis-text-dim uppercase tracking-wider mb-2 block">
              Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateSettings({ pitch: 0.55, rate: 0.92 })}
                className={`px-3 py-2 text-[10px] rounded-lg border transition-all ${
                  settings.pitch === 0.55 && settings.rate === 0.92
                    ? "border-jarvis-blue bg-jarvis-blue/20 text-jarvis-blue"
                    : "border-jarvis-border/30 text-jarvis-text-dim hover:border-jarvis-blue/30"
                }`}
              >
                🎵 Deep Bass
              </button>
              <button
                onClick={() => updateSettings({ pitch: 0.4, rate: 0.85 })}
                className={`px-3 py-2 text-[10px] rounded-lg border transition-all ${
                  settings.pitch === 0.4 && settings.rate === 0.85
                    ? "border-jarvis-blue bg-jarvis-blue/20 text-jarvis-blue"
                    : "border-jarvis-border/30 text-jarvis-text-dim hover:border-jarvis-blue/30"
                }`}
              >
                🌑 Ultra Deep
              </button>
              <button
                onClick={() => updateSettings({ pitch: 0.7, rate: 0.95 })}
                className={`px-3 py-2 text-[10px] rounded-lg border transition-all ${
                  settings.pitch === 0.7 && settings.rate === 0.95
                    ? "border-jarvis-blue bg-jarvis-blue/20 text-jarvis-blue"
                    : "border-jarvis-border/30 text-jarvis-text-dim hover:border-jarvis-blue/30"
                }`}
              >
                🎙️ Authoritative
              </button>
            </div>
          </div>

          {/* Preview & Reset */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                if (isSpeaking) { stop(); } else { preview(); }
              }}
              className="flex-1 px-4 py-2.5 bg-jarvis-blue text-jarvis-bg rounded-lg text-xs font-medium hover:bg-jarvis-cyan transition-colors"
            >
              {isSpeaking ? "⏹ Stop" : "▶ Preview Voice"}
            </button>
            <button
              onClick={() => updateSettings({ pitch: 0.55, rate: 0.92, voiceName: null })}
              className="px-4 py-2.5 border border-jarvis-border/40 text-jarvis-text-dim rounded-lg text-xs hover:text-jarvis-text hover:border-jarvis-border transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
