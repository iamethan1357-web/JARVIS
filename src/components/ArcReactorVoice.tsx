"use client";

import { useEffect, useState } from "react";

interface ArcReactorVoiceProps {
  state: "idle" | "listening" | "processing" | "speaking";
  isUserSpeaking: boolean;
  onClick: () => void;
}

export default function ArcReactorVoice({ state, isUserSpeaking, onClick }: ArcReactorVoiceProps) {
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(24).fill(0.3));

  useEffect(() => {
    if (state === "speaking" || (state === "listening" && isUserSpeaking)) {
      const interval = setInterval(() => {
        setWaveformBars(Array(24).fill(0).map(() => 0.2 + Math.random() * 0.8));
      }, 80);
      return () => clearInterval(interval);
    } else if (state === "listening") {
      const interval = setInterval(() => {
        setWaveformBars(Array(24).fill(0).map(() => 0.15 + Math.random() * 0.25));
      }, 150);
      return () => clearInterval(interval);
    } else {
      setWaveformBars(Array(24).fill(0.3));
    }
  }, [state, isUserSpeaking]);

  const isActive = state !== "idle";
  const coreColor = state === "speaking" ? "#48cae4" : state === "processing" ? "#f59e0b" : "#00b4d8";

  return (
    <button
      onClick={onClick}
      className="relative w-48 h-48 flex items-center justify-center cursor-pointer group focus:outline-none"
      aria-label={state === "listening" ? "Stop listening" : "Start listening"}
    >
      {/* Outermost ring */}
      <div
        className={`absolute inset-0 rounded-full border transition-all duration-500 ${
          isActive ? "border-jarvis-blue/30 animate-voice-ring-3" : "border-jarvis-border/20"
        }`}
      />

      {/* Outer ring with dashes */}
      <div
        className={`absolute inset-3 rounded-full border-2 border-dashed transition-all duration-500 ${
          isActive ? "border-jarvis-blue/30" : "border-jarvis-border/15"
        } ${state === "speaking" ? "animate-spin-slow" : state === "listening" ? "animate-spin-reverse" : ""}`}
      />

      {/* Middle ring */}
      <div
        className={`absolute inset-6 rounded-full border transition-all duration-500 ${
          isActive ? "border-jarvis-blue/40 animate-voice-ring-2" : "border-jarvis-border/20"
        }`}
      />

      {/* Inner animated ring */}
      <div
        className={`absolute inset-9 rounded-full border-2 transition-all duration-500 ${
          isActive ? "border-jarvis-blue/50 animate-voice-ring-1" : "border-jarvis-border/30"
        }`}
      />

      {/* Waveform ring */}
      <div className="absolute inset-10 rounded-full overflow-hidden">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {waveformBars.map((height, i) => {
            const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
            const innerR = 70;
            const barLength = 20 * height;
            const x1 = 100 + innerR * Math.cos(angle);
            const y1 = 100 + innerR * Math.sin(angle);
            const x2 = 100 + (innerR + barLength) * Math.cos(angle);
            const y2 = 100 + (innerR + barLength) * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={coreColor}
                strokeWidth="2"
                strokeLinecap="round"
                opacity={isActive ? 0.6 + height * 0.4 : 0.2}
                style={{ transition: "all 0.1s ease-out" }}
              />
            );
          })}
        </svg>
      </div>

      {/* Core circle */}
      <div
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
          state === "speaking"
            ? "animate-voice-speaking"
            : state === "listening"
            ? "animate-voice-core"
            : state === "processing"
            ? "animate-arc-reactor"
            : "group-hover:shadow-[0_0_30px_rgba(0,180,216,0.3)]"
        }`}
        style={{
          background: `radial-gradient(circle, ${coreColor}20 0%, ${coreColor}08 60%, transparent 100%)`,
          border: `2px solid ${coreColor}${isActive ? "80" : "40"}`,
        }}
      >
        {/* Inner core glow */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${coreColor}30 0%, transparent 70%)`,
          }}
        >
          {state === "listening" ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="transition-all">
              <path
                d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"
                fill={coreColor}
                opacity={isUserSpeaking ? 1 : 0.6}
                className="transition-opacity"
              />
              <path
                d="M19 10v2a7 7 0 0 1-14 0v-2"
                stroke={coreColor}
                strokeWidth="2"
                strokeLinecap="round"
                opacity={isUserSpeaking ? 1 : 0.6}
              />
              <line x1="12" y1="19" x2="12" y2="23" stroke={coreColor} strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="23" x2="16" y2="23" stroke={coreColor} strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : state === "speaking" ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill={coreColor} opacity="0.8" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke={coreColor} strokeWidth="2" strokeLinecap="round" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke={coreColor} strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </svg>
          ) : state === "processing" ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="animate-spin">
              <circle cx="12" cy="12" r="9" stroke={coreColor} strokeWidth="2" strokeDasharray="20 40" strokeLinecap="round" />
            </svg>
          ) : (
            <span className="text-xl font-bold font-mono" style={{ color: coreColor }}>
              J
            </span>
          )}
        </div>
      </div>

      {/* State label */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
        <span
          className="text-[9px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded-full border"
          style={{
            color: coreColor,
            borderColor: `${coreColor}40`,
            backgroundColor: `${coreColor}10`,
          }}
        >
          {state === "listening" ? (isUserSpeaking ? "hearing you" : "listening") :
           state === "speaking" ? "speaking" :
           state === "processing" ? "processing" :
           "tap to speak"}
        </span>
      </div>
    </button>
  );
}
