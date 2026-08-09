"use client";

import { useEffect, useState, useCallback } from "react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  low: "text-jarvis-text-dim border-jarvis-text-dim/30",
  medium: "text-jarvis-blue border-jarvis-blue/30",
  high: "text-jarvis-gold border-jarvis-gold/30",
  critical: "text-jarvis-red border-jarvis-red/30",
};

const statusIcons: Record<string, string> = {
  pending: "○",
  in_progress: "◐",
  completed: "●",
};

export default function TasksView() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", priority: "medium", dueDate: "" });

  const loadTasks = useCallback(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => {
        setTasks(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const createTask = async () => {
    if (!formData.title.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ title: "", description: "", priority: "medium", dueDate: "" });
    setShowForm(false);
    loadTasks();
  };

  const updateStatus = async (task: Task, newStatus: string) => {
    await fetch("/api/tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status: newStatus }),
    });
    loadTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    loadTasks();
  };

  if (loading) {
    return <LoadingState text="Loading task registry..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-jarvis-text">Task Management</h2>
          <p className="text-xs text-jarvis-text-dim mt-1">
            {tasks.filter(t => t.status === "pending").length} pending • {tasks.filter(t => t.status === "completed").length} completed
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-jarvis-blue/20 border border-jarvis-blue/40 text-jarvis-blue rounded-lg text-sm hover:bg-jarvis-blue/30 transition-all"
        >
          + New Task
        </button>
      </div>

      {showForm && (
        <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-jarvis-blue uppercase tracking-wider">New Directive</h3>
          <input
            type="text"
            placeholder="Task title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text placeholder-jarvis-text-dim/50 focus:outline-none focus:border-jarvis-blue/50"
          />
          <textarea
            placeholder="Description (optional)..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text placeholder-jarvis-text-dim/50 focus:outline-none focus:border-jarvis-blue/50 h-20 resize-none"
          />
          <div className="flex gap-3 flex-wrap">
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-blue/50"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical</option>
            </select>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="bg-jarvis-bg border border-jarvis-border/50 rounded-lg px-4 py-2.5 text-sm text-jarvis-text focus:outline-none focus:border-jarvis-blue/50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={createTask}
              className="px-4 py-2 bg-jarvis-blue text-jarvis-bg rounded-lg text-sm font-medium hover:bg-jarvis-cyan transition-colors"
            >
              Create Task
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

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-8 text-center">
            <p className="text-jarvis-text-dim text-sm">Task queue is empty, Sir. A remarkably clean slate.</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`bg-jarvis-panel border border-jarvis-border/40 rounded-xl p-4 hover:border-jarvis-blue/30 transition-all group ${
                task.status === "completed" ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() =>
                    updateStatus(
                      task,
                      task.status === "pending" ? "in_progress" : task.status === "in_progress" ? "completed" : "pending"
                    )
                  }
                  className={`mt-0.5 text-lg transition-colors ${
                    task.status === "completed" ? "text-jarvis-green" : task.status === "in_progress" ? "text-jarvis-blue" : "text-jarvis-text-dim"
                  } hover:text-jarvis-blue`}
                >
                  {statusIcons[task.status] || "○"}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${task.status === "completed" ? "line-through text-jarvis-text-dim" : "text-jarvis-text"}`}>
                      {task.title}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-jarvis-text-dim mt-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-jarvis-text-dim">
                    {task.dueDate && (
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                    <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-jarvis-text-dim/40 hover:text-jarvis-red transition-colors opacity-0 group-hover:opacity-100 text-sm"
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

function LoadingState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-8 h-8 rounded-full border border-jarvis-blue mx-auto mb-3 animate-arc-reactor" />
        <p className="text-jarvis-text-dim text-xs font-mono">{text}</p>
      </div>
    </div>
  );
}
