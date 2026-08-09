"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import DashboardView from "@/components/DashboardView";
import TasksView from "@/components/TasksView";
import NotesView from "@/components/NotesView";
import RemindersView from "@/components/RemindersView";
import SmartHomeView from "@/components/SmartHomeView";
import AutomationsView from "@/components/AutomationsView";
import ChatView from "@/components/ChatView";
import TopBar from "@/components/TopBar";
import FloatingVoiceButton from "@/components/FloatingVoiceButton";
import NotificationSetup from "@/components/NotificationSetup";

export type View = "dashboard" | "tasks" | "notes" | "reminders" | "smarthome" | "automations" | "chat";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  // Handle URL params for deep linking (e.g., from notifications)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const view = params.get("view") as View;
      if (view && ["dashboard", "tasks", "notes", "reminders", "smarthome", "automations", "chat"].includes(view)) {
        setCurrentView(view);
      }
    }
  }, []);

  const handleNavigate = (v: View | string) => {
    setCurrentView(v as View);
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard": return <DashboardView onNavigate={handleNavigate} />;
      case "tasks": return <TasksView />;
      case "notes": return <NotesView />;
      case "reminders": return <RemindersView />;
      case "smarthome": return <SmartHomeView />;
      case "automations": return <AutomationsView />;
      case "chat": return <ChatView onNavigate={handleNavigate} />;
      default: return <DashboardView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar currentView={currentView} onNavigate={handleNavigate} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderView()}
        </main>
      </div>
      {/* Global floating voice button - visible on all pages except chat */}
      {currentView !== "chat" && (
        <FloatingVoiceButton onNavigateToChat={() => handleNavigate("chat")} />
      )}
      {/* Notification setup banner */}
      <NotificationSetup />
    </div>
  );
}
