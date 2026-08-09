"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Stored voice preferences
interface VoiceSettings {
  pitch: number;
  rate: number;
  voiceName: string | null;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  pitch: 0.55,    // Deep bass pitch
  rate: 0.92,     // Slightly slower for gravitas
  voiceName: null, // Auto-select best male voice
};

function loadSettings(): VoiceSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem("jarvis-voice-settings");
    if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: VoiceSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("jarvis-voice-settings", JSON.stringify(settings));
  } catch {}
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load settings and voices
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window.speechSynthesis) return;

    setIsSupported(true);
    setSettings(loadSettings());

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  // Select the deepest, most authoritative male voice
  const getJarvisVoice = useCallback((): SpeechSynthesisVoice | null => {
    // If user has selected a specific voice, use it
    if (settings.voiceName) {
      const selected = voices.find((v) => v.name === settings.voiceName);
      if (selected) return selected;
    }

    // Deep male voice priority list — tested across browsers
    // These are known deep/bass male voices on various platforms
    const deepMaleNames = [
      // Google Chrome deep male voices
      "Google UK English Male",
      "Google US English",
      // Microsoft Edge deep voices  
      "Microsoft Guy Online (Natural)",
      "Microsoft Ryan Online (Natural)",
      "Microsoft Mark Online (Natural)",
      "Microsoft David Online (Natural)",
      "Microsoft George Online (Natural)",
      // macOS / iOS deep male voices
      "Daniel",         // British English (deep)
      "Aaron",          // US English (deep)
      "Arthur",         // British (very deep)
      "Fred",           // Classic deep Mac voice
      "Ralph",          // Deep gravelly
      "Albert",         // Deep and distinct
      "Alex",           // Classic deep
      "Oliver",         // British male
      "James",          // British male
      "Tom",            // Deep male
      // Linux espeak deep voices
      "english-us",
      "english_rp",
    ];

    // 1. Try exact match with known deep voices
    for (const name of deepMaleNames) {
      const match = voices.find((v) => v.name === name);
      if (match) return match;
    }

    // 2. Try partial match with known deep voice names
    for (const name of deepMaleNames) {
      const match = voices.find((v) =>
        v.name.toLowerCase().includes(name.toLowerCase())
      );
      if (match) return match;
    }

    // 3. Preference cascade: British English male → English male → any male
    const preferences = [
      // British male (JARVIS should sound British)
      (v: SpeechSynthesisVoice) =>
        v.lang.startsWith("en-GB") &&
        /male|daniel|james|george|oliver|arthur|harry|william|thomas/i.test(v.name) &&
        !/(female|woman|girl)/i.test(v.name),

      // Any British English (excluding known female)
      (v: SpeechSynthesisVoice) =>
        v.lang.startsWith("en-GB") &&
        !/(female|woman|girl|fiona|kate|serena|martha|alice|emma|amy|joanna|salli|kendra|ivy|ruth|jenny|aria|jane|libby|maisie|rosa|holly|susan|stephanie)/i.test(v.name),

      // US English male voices
      (v: SpeechSynthesisVoice) =>
        v.lang.startsWith("en-US") &&
        /male|guy|ryan|mark|david|aaron|eric|christopher|jacob|davis|steffan|roger|reed|brian/i.test(v.name) &&
        !/(female|woman|girl)/i.test(v.name),

      // Any English male
      (v: SpeechSynthesisVoice) =>
        v.lang.startsWith("en") &&
        /male|daniel|james|david|mark|alex|guy|ryan|aaron|tom|fred|ralph|arthur/i.test(v.name),

      // Any English excluding known female names
      (v: SpeechSynthesisVoice) =>
        v.lang.startsWith("en") &&
        !/(female|woman|girl|samantha|victoria|karen|fiona|moira|tessa|zira|hazel|susan|jenny|aria|salli|kendra|joanna|ivy|ruth|emma|amy|nicole|olivia|sarah|emily|anna|alice|chloe|lily|sophia|mia|ava|isabella|charlotte|allison|kate|martha|rosa|holly|stephanie|libby|maisie|jane)/i.test(v.name),

      // Absolute fallback: any English voice
      (v: SpeechSynthesisVoice) => v.lang.startsWith("en"),
    ];

    for (const predicate of preferences) {
      const match = voices.find(predicate);
      if (match) return match;
    }

    return voices[0] || null;
  }, [voices, settings.voiceName]);

  // Get all English voices for the settings UI
  const getEnglishVoices = useCallback(() => {
    return voices
      .filter((v) => v.lang.startsWith("en"))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [voices]);

  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (!isSupported || typeof window === "undefined") {
          resolve();
          return;
        }

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Clean text for speech — strip markdown, emojis, formatting
        const cleanText = text
          .replace(/\*\*([^*]+)\*\*/g, "$1")
          .replace(/[📋🏠⏰🎯📝💬⚡🟢🛡️💡🌡️🔊🔒📹📌🍳💪💰💼❤️🧠📱📚🌤️🧮📐🔔⚠️⏹🎤🎙️🔇]/gu, "")
          .replace(/\n+/g, ". ")
          .replace(/\s{2,}/g, " ")
          .replace(/\.\s*\./g, ".")
          .trim();

        if (!cleanText) {
          resolve();
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utteranceRef.current = utterance;

        const voice = getJarvisVoice();
        if (voice) {
          utterance.voice = voice;
        }

        // Deep, authoritative voice settings
        utterance.pitch = settings.pitch;     // Low pitch for deep bass
        utterance.rate = settings.rate;       // Slightly slow for gravitas
        utterance.volume = 1.0;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = () => {
          setIsSpeaking(false);
          resolve();
        };

        window.speechSynthesis.speak(utterance);
      });
    },
    [isSupported, getJarvisVoice, settings.pitch, settings.rate]
  );

  const stop = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Update voice settings
  const updateSettings = useCallback((newSettings: Partial<VoiceSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Preview voice with current settings
  const preview = useCallback(
    (text?: string) => {
      const previewText = text || "Systems online, Sir. All diagnostics nominal. Awaiting your command.";
      speak(previewText);
    },
    [speak]
  );

  return {
    isSpeaking,
    isSupported,
    speak,
    stop,
    voices,
    settings,
    updateSettings,
    preview,
    getEnglishVoices,
    getJarvisVoice,
  };
}
