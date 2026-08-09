"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import ArcReactorVoice from "./ArcReactorVoice";
import VoiceSettings from "./VoiceSettings";

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt: string;
  navTarget?: string | null;
}

function formatMessage(content: string) {
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-jarvis-text font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatView({ onNavigate }: { onNavigate?: (v: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingVoiceSend = useRef(false);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = useCallback(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      });
  }, []);

  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Handle voice transcript completion
  useEffect(() => {
    if (transcript && !isListening && !pendingVoiceSend.current) {
      pendingVoiceSend.current = true;
      setInput(transcript);
    }
  }, [transcript, isListening]);

  // Send message when input is set from voice
  useEffect(() => {
    if (pendingVoiceSend.current && input) {
      pendingVoiceSend.current = false;
      sendMessage(input);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input]);

  const sendMessage = async (overrideMsg?: string) => {
    const msgToSend = overrideMsg || input.trim();
    if (!msgToSend || sending) return;
    setInput("");
    setSending(true);

    const tempUserMsg: ChatMessage = {
      id: "temp-user-" + Date.now(),
      role: "user",
      content: msgToSend,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msgToSend }),
      });
      const assistantMsg = await res.json();
      setMessages((prev) => {
        const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
        return [...withoutTemp, { ...tempUserMsg, id: "user-" + Date.now() }, assistantMsg];
      });

      // Handle navigation
      if (assistantMsg.navTarget && onNavigate) {
        setTimeout(() => onNavigate(assistantMsg.navTarget), 1500);
      }

      // Speak response if voice is enabled
      if (voiceEnabled && ttsSupported) {
        await speak(assistantMsg.content);
        // If in voice mode, restart listening after speaking
        if (voiceMode && micSupported) {
          setTimeout(() => startListening(), 300);
        }
      }
    } catch {
      const errMsg: ChatMessage = {
        id: "error-" + Date.now(),
        role: "assistant",
        content: "I apologize, Sir. I seem to have encountered a temporary communication disruption. Shall we try again?",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
      if (voiceEnabled && ttsSupported) {
        await speak(errMsg.content);
      }
    }
    setSending(false);
    if (!voiceMode) inputRef.current?.focus();
  };

  const clearChat = async () => {
    stopSpeaking();
    await fetch("/api/chat", { method: "DELETE" });
    setMessages([]);
  };

  const toggleVoiceMode = () => {
    if (voiceMode) {
      setVoiceMode(false);
      stopListening();
      stopSpeaking();
    } else {
      setVoiceMode(true);
      startListening();
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      stopSpeaking();
      startListening();
    }
  };

  const voiceState: "idle" | "listening" | "processing" | "speaking" =
    jarvisSpeaking ? "speaking" :
    sending ? "processing" :
    isListening ? "listening" :
    "idle";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-jarvis-blue mx-auto mb-4 animate-arc-reactor flex items-center justify-center">
            <span className="text-jarvis-blue font-bold text-xl font-mono">J</span>
          </div>
          <p className="text-jarvis-text-dim text-sm font-mono">Establishing secure channel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col animate-fade-in">
      {/* Chat header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-jarvis-blue flex items-center justify-center animate-arc-reactor bg-jarvis-blue/10">
            <span className="text-jarvis-blue font-bold text-sm font-mono">J</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-jarvis-text">J.A.R.V.I.S. Interface</h2>
            <p className="text-[10px] text-jarvis-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-jarvis-green animate-pulse" />
              {voiceMode ? "Voice Mode Active" : "Secure Channel Active"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Voice settings */}
          {ttsSupported && <VoiceSettings />}
          {/* Voice toggle */}
          {ttsSupported && (
            <button
              onClick={() => {
                setVoiceEnabled(!voiceEnabled);
                if (jarvisSpeaking) stopSpeaking();
              }}
              title={voiceEnabled ? "Mute JARVIS voice" : "Unmute JARVIS voice"}
              className={`p-2 rounded-lg border transition-all text-xs ${
                voiceEnabled
                  ? "border-jarvis-blue/30 text-jarvis-blue hover:bg-jarvis-blue/10"
                  : "border-jarvis-border/30 text-jarvis-text-dim hover:text-jarvis-text"
              }`}
            >
              {voiceEnabled ? "🔊" : "🔇"}
            </button>
          )}
          {/* Voice mode toggle */}
          {micSupported && (
            <button
              onClick={toggleVoiceMode}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                voiceMode
                  ? "border-jarvis-blue bg-jarvis-blue/20 text-jarvis-blue shadow-[0_0_15px_rgba(0,180,216,0.2)]"
                  : "border-jarvis-border/30 text-jarvis-text-dim hover:text-jarvis-blue hover:border-jarvis-blue/30"
              }`}
            >
              🎙️ {voiceMode ? "Voice On" : "Voice Off"}
            </button>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-xs text-jarvis-text-dim hover:text-jarvis-red transition-colors px-3 py-1.5 rounded-lg border border-jarvis-border/30 hover:border-jarvis-red/30"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Voice mode arc reactor */}
      {voiceMode && (
        <div className="flex flex-col items-center py-6 shrink-0">
          <ArcReactorVoice
            state={voiceState}
            isUserSpeaking={isUserSpeaking}
            onClick={handleMicClick}
          />
          <div className="mt-4 text-center min-h-[52px]">
            {voiceState === "listening" && (
              <div className="animate-fade-in">
                <p className="text-xs text-jarvis-blue font-mono uppercase tracking-wider mb-1">
                  {isUserSpeaking ? "Listening..." : "Awaiting command..."}
                </p>
                {(interimTranscript || transcript) && (
                  <p className="text-sm text-jarvis-text max-w-md">
                    &ldquo;{interimTranscript || transcript}&rdquo;
                  </p>
                )}
              </div>
            )}
            {voiceState === "processing" && (
              <p className="text-xs text-jarvis-gold font-mono uppercase tracking-wider animate-pulse">
                Processing directive...
              </p>
            )}
            {voiceState === "speaking" && (
              <p className="text-xs text-jarvis-cyan font-mono uppercase tracking-wider">
                Speaking...
              </p>
            )}
            {voiceState === "idle" && !sending && (
              <p className="text-xs text-jarvis-text-dim font-mono">
                Tap the reactor or say something, Sir
              </p>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
        {messages.length === 0 && !voiceMode && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-full border-2 border-jarvis-blue/30 flex items-center justify-center mb-6 animate-arc-reactor">
              <span className="text-jarvis-blue font-bold text-2xl font-mono">J</span>
            </div>
            <h3 className="text-lg font-semibold text-jarvis-text mb-2">
              At your service, Sir.
            </h3>
            <p className="text-sm text-jarvis-text-dim max-w-md mb-1">
              Type or speak your commands. I respond to voice and text.
            </p>
            {micSupported && (
              <p className="text-xs text-jarvis-blue mb-4">
                🎙️ Click &ldquo;Voice On&rdquo; to activate voice mode
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {["System status", "Turn on all lights", "Help", "Create task: Review plans"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                    setTimeout(() => sendMessage(suggestion), 50);
                  }}
                  className="px-3 py-1.5 text-xs border border-jarvis-border/40 rounded-full text-jarvis-text-dim hover:text-jarvis-blue hover:border-jarvis-blue/40 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 animate-fade-in ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full border border-jarvis-blue/50 flex items-center justify-center bg-jarvis-blue/10 shrink-0 mt-0.5">
                <span className="text-jarvis-blue text-xs font-bold font-mono">J</span>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-jarvis-blue/20 border border-jarvis-blue/30 text-jarvis-text rounded-br-sm"
                  : "bg-jarvis-panel border border-jarvis-border/40 text-jarvis-text-dim rounded-bl-sm"
              }`}
            >
              {msg.content.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-1.5" : ""}>
                  {formatMessage(line)}
                </p>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <p className="text-[9px] opacity-40 font-mono">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
                {msg.role === "assistant" && ttsSupported && (
                  <button
                    onClick={() => {
                      if (jarvisSpeaking) { stopSpeaking(); } else { speak(msg.content); }
                    }}
                    className="text-[9px] opacity-40 hover:opacity-100 hover:text-jarvis-blue transition-all"
                    title="Replay voice"
                  >
                    {jarvisSpeaking ? "⏹" : "🔊"}
                  </button>
                )}
              </div>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-jarvis-panel-light border border-jarvis-border/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs">👤</span>
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full border border-jarvis-blue/50 flex items-center justify-center bg-jarvis-blue/10 shrink-0">
              <span className="text-jarvis-blue text-xs font-bold font-mono">J</span>
            </div>
            <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-jarvis-blue/50 rounded-full" style={{ animation: "typing-dot 1.4s infinite 0s" }} />
                <span className="w-2 h-2 bg-jarvis-blue/50 rounded-full" style={{ animation: "typing-dot 1.4s infinite 0.2s" }} />
                <span className="w-2 h-2 bg-jarvis-blue/50 rounded-full" style={{ animation: "typing-dot 1.4s infinite 0.4s" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <form
        id="chat-form"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex gap-2 pt-4 border-t border-jarvis-border/30 shrink-0"
      >
        {micSupported && !voiceMode && (
          <button
            type="button"
            onClick={handleMicClick}
            className={`px-3 py-3 rounded-xl border transition-all shrink-0 ${
              isListening
                ? "border-jarvis-red bg-jarvis-red/20 text-jarvis-red animate-mic-bounce"
                : "border-jarvis-border/50 text-jarvis-text-dim hover:text-jarvis-blue hover:border-jarvis-blue/50"
            }`}
            title={isListening ? "Stop listening" : "Voice input"}
          >
            🎤
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          value={isListening ? (interimTranscript || transcript || input) : input}
          onChange={(e) => { if (!isListening) setInput(e.target.value); }}
          placeholder={isListening ? "Listening..." : "Speak or type, Sir..."}
          disabled={sending || isListening}
          className="flex-1 bg-jarvis-panel border border-jarvis-border/50 rounded-xl px-4 py-3 text-sm text-jarvis-text placeholder-jarvis-text-dim/50 focus:outline-none focus:border-jarvis-blue/50 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={sending || (!input.trim() && !isListening)}
          className="px-5 py-3 bg-jarvis-blue text-jarvis-bg rounded-xl text-sm font-medium hover:bg-jarvis-cyan transition-colors disabled:opacity-30 disabled:hover:bg-jarvis-blue shrink-0"
        >
          Send
        </button>
      </form>
    </div>
  );
}
