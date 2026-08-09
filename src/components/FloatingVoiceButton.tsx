"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";

interface FloatingVoiceButtonProps {
  onNavigateToChat: () => void;
}

export default function FloatingVoiceButton({ onNavigateToChat }: FloatingVoiceButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const [response, setResponse] = useState("");
  const [showResponse, setShowResponse] = useState(false);
  const pendingSend = useRef(false);

  const {
    isListening,
    isSpeaking: isUserSpeaking,
    transcript,
    interimTranscript,
    isSupported: micSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition();

  const {
    isSpeaking: jarvisSpeaking,
    isSupported: ttsSupported,
    speak,
    stop: stopSpeaking,
  } = useSpeechSynthesis();

  const sendVoiceCommand = useCallback(async (text: string) => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setResponse(data.content);
      setShowResponse(true);

      if (ttsSupported) {
        await speak(data.content);
      }

      // Auto-hide response after a delay
      setTimeout(() => {
        setShowResponse(false);
        setResponse("");
      }, 8000);
    } catch {
      setResponse("Communication error, Sir.");
      setShowResponse(true);
      setTimeout(() => { setShowResponse(false); setResponse(""); }, 4000);
    }
  }, [ttsSupported, speak]);

  // Handle transcript completion
  useEffect(() => {
    if (transcript && !isListening && !pendingSend.current) {
      pendingSend.current = true;
      sendVoiceCommand(transcript);
      pendingSend.current = false;
    }
  }, [transcript, isListening, sendVoiceCommand]);

  if (!micSupported) return null;

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else if (jarvisSpeaking) {
      stopSpeaking();
    } else {
      setExpanded(true);
      setShowResponse(false);
      startListening();
    }
  };

  const isActive = isListening || jarvisSpeaking || isUserSpeaking;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Response bubble */}
      {showResponse && response && (
        <div className="max-w-sm bg-jarvis-panel border border-jarvis-blue/30 rounded-2xl rounded-br-sm px-4 py-3 shadow-[0_0_30px_rgba(0,180,216,0.15)] animate-fade-in">
          <div className="flex items-start gap-2">
            <span className="text-jarvis-blue text-xs font-bold font-mono mt-0.5">J</span>
            <p className="text-xs text-jarvis-text-dim leading-relaxed">{response}</p>
          </div>
          <button
            onClick={() => { setShowResponse(false); setResponse(""); }}
            className="text-[9px] text-jarvis-text-dim/40 hover:text-jarvis-text-dim mt-1"
          >
            dismiss
          </button>
        </div>
      )}

      {/* Listening indicator */}
      {expanded && isListening && (
        <div className="bg-jarvis-panel border border-jarvis-blue/30 rounded-xl px-4 py-2 shadow-lg animate-fade-in">
          <p className="text-xs text-jarvis-blue font-mono">
            {isUserSpeaking ? "🎤 Listening..." : "🎤 Waiting for voice..."}
          </p>
          {(interimTranscript || transcript) && (
            <p className="text-xs text-jarvis-text mt-1 max-w-xs truncate">
              &ldquo;{interimTranscript || transcript}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Main button row */}
      <div className="flex items-center gap-2">
        {/* Open full chat button */}
        {expanded && (
          <button
            onClick={() => {
              stopListening();
              stopSpeaking();
              setExpanded(false);
              onNavigateToChat();
            }}
            className="w-10 h-10 rounded-full bg-jarvis-panel border border-jarvis-border/40 text-jarvis-text-dim hover:text-jarvis-blue hover:border-jarvis-blue/30 transition-all flex items-center justify-center text-sm animate-fade-in"
            title="Open full chat"
          >
            💬
          </button>
        )}

        {/* Voice button */}
        <button
          onClick={handleClick}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
            isActive
              ? "bg-jarvis-blue/20 border-2 border-jarvis-blue shadow-[0_0_30px_rgba(0,180,216,0.4)]"
              : "bg-jarvis-panel border-2 border-jarvis-border hover:border-jarvis-blue/50 hover:shadow-[0_0_20px_rgba(0,180,216,0.2)]"
          }`}
        >
          {/* Pulse rings when active */}
          {isActive && (
            <>
              <span className="absolute inset-0 rounded-full border border-jarvis-blue/30 animate-voice-ring-1" />
              <span className="absolute -inset-2 rounded-full border border-jarvis-blue/20 animate-voice-ring-2" />
              <span className="absolute -inset-4 rounded-full border border-jarvis-blue/10 animate-voice-ring-3" />
            </>
          )}
          <span className="relative text-xl">
            {jarvisSpeaking ? "🔊" : isListening ? "🎤" : "🎙️"}
          </span>
        </button>
      </div>
    </div>
  );
}
