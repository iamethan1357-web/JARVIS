"use client";

import { useEffect, useState, useCallback } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
  category: string | null;
  pinned: boolean;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  general: "bg-jarvis-blue/20 text-jarvis-blue",
  personal: "bg-jarvis-purple/20 text-jarvis-purple",
  work: "bg-jarvis-gold/20 text-jarvis-gold",
  research: "bg-jarvis-green/20 text-jarvis-green",
  security: "bg-jarvis-red/20 text-jarvis-red",
};

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "", category: "general" });

  const loadNotes = useCallback(() => {
    fetch("/api/notes")
      .then((r) => r.json())
      .then((data) => {
        setNotes(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  const createNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return;
    await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ title: "", content: "", category: "general" });
    setShowForm(false);
    loadNotes();
  };

  const togglePin = async (note: Note) => {
    await fetch("/api/notes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...note, pinned: !note.pinned }),
    });
    loadNotes();
  };

  const deleteNote = async (id: string) => {
    await fetch(`/api/notes?id=${id}`, { method: "DELETE" });
    loadNotes();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border border-jarvis-blue mx-auto mb-3 animate-arc-reactor" />
          <p className="text-jarvis-text-dim text-xs font-mono">Accessing memory banks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-jarvis-text">Memory Bank</h2>
          <p className="text-xs text-jarvis-text-dim mt-1">{notes.length} entries stored</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-jarvis-blue/20 border border-jarvis-blue/40 text-jarvis-blue rounded-lg text-sm hover:bg-jarvis-blue/30 transition-all"
        >
          + New Entry
        </button>
      </div>

      {showForm && (
        <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-jarvis-blue uppercase tracking-wider">New Memory Entry</h3>
          <input
            type="text"
            placeholder="Title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text placeholder-jarvis-text-dim/50 focus:outline-none focus:border-jarvis-blue/50"
          />
          <textarea
            placeholder="Content..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text placeholder-jarvis-text-dim/50 focus:outline-none focus:border-jarvis-blue/50 h-28 resize-none"
          />
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-blue/50"
          >
            <option value="general">General</option>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
            <option value="research">Research</option>
            <option value="security">Security</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={createNote}
              className="px-4 py-2 bg-jarvis-blue text-jarvis-bg rounded-lg text-sm font-medium hover:bg-jarvis-cyan transition-colors"
            >
              Store Entry
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

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-8 text-center">
          <p className="text-jarvis-text-dim text-sm">Memory banks are empty, Sir. Shall we begin documenting?</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-5 hover:border-jarvis-blue/30 transition-all group relative"
            >
              {note.pinned && (
                <span className="absolute top-3 right-3 text-jarvis-gold text-sm">📌</span>
              )}
              <div className="flex items-start gap-2 mb-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[note.category || "general"] || categoryColors.general}`}>
                  {(note.category || "general").toUpperCase()}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-jarvis-text mb-2">{note.title}</h4>
              <p className="text-xs text-jarvis-text-dim leading-relaxed line-clamp-4">{note.content}</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-jarvis-border/20">
                <span className="text-[10px] text-jarvis-text-dim">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => togglePin(note)}
                    className="text-xs text-jarvis-text-dim hover:text-jarvis-gold transition-colors"
                  >
                    {note.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-xs text-jarvis-text-dim hover:text-jarvis-red transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
