"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface NotificationState {
  permission: NotificationPermission | "unsupported";
  isSupported: boolean;
  swRegistration: ServiceWorkerRegistration | null;
}

export function useNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: "unsupported",
    isSupported: false,
    swRegistration: null,
  });
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const notifiedRemindersRef = useRef<Set<string>>(new Set());

  // Initialize notification state and service worker
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isSupported = "Notification" in window && "serviceWorker" in navigator;
    
    if (!isSupported) {
      setState((s) => ({ ...s, isSupported: false, permission: "unsupported" }));
      return;
    }

    setState((s) => ({
      ...s,
      isSupported: true,
      permission: Notification.permission,
    }));

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[JARVIS] Service Worker registered:", registration.scope);
        setState((s) => ({ ...s, swRegistration: registration }));
      })
      .catch((error) => {
        console.error("[JARVIS] Service Worker registration failed:", error);
      });

    // Listen for permission changes
    if ("permissions" in navigator) {
      navigator.permissions
        .query({ name: "notifications" as PermissionName })
        .then((permissionStatus) => {
          permissionStatus.onchange = () => {
            setState((s) => ({ ...s, permission: Notification.permission }));
          };
        })
        .catch(() => {});
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState((s) => ({ ...s, permission }));
      return permission === "granted";
    } catch {
      return false;
    }
  }, [state.isSupported]);

  // Show a notification
  const showNotification = useCallback(
    async (title: string, options?: NotificationOptions & { data?: Record<string, unknown> }) => {
      if (!state.isSupported || state.permission !== "granted") {
        console.warn("[JARVIS] Notifications not available or not permitted");
        return null;
      }

      // Use service worker for notification if available
      if (state.swRegistration) {
        try {
          const swOptions: NotificationOptions & { vibrate?: number[]; requireInteraction?: boolean } = {
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            ...options,
          };
          await state.swRegistration.showNotification(title, swOptions);
          return null;
        } catch {
          console.warn("[JARVIS] SW notification failed, falling back to direct");
        }
      }

      // Fallback to direct notification
      return new Notification(title, {
        icon: "/icons/icon-192.png",
        ...options,
      });
    },
    [state.isSupported, state.permission, state.swRegistration]
  );

  // Check for due reminders and show notifications
  const checkReminders = useCallback(async () => {
    if (state.permission !== "granted") return;

    try {
      const response = await fetch("/api/reminders/due");
      if (!response.ok) return;

      const dueReminders = await response.json();

      for (const reminder of dueReminders) {
        // Skip if already notified in this session
        if (notifiedRemindersRef.current.has(reminder.id)) continue;

        notifiedRemindersRef.current.add(reminder.id);

        await showNotification(`⏰ JARVIS Reminder`, {
          body: reminder.title + (reminder.description ? `\n${reminder.description}` : ""),
          tag: `reminder-${reminder.id}`,
          data: { reminderId: reminder.id, url: "/?view=reminders" },
        });
      }
    } catch (error) {
      console.error("[JARVIS] Error checking reminders:", error);
    }
  }, [state.permission, showNotification]);

  // Start/stop reminder checking
  const startReminderChecks = useCallback(() => {
    if (checkIntervalRef.current) return;

    // Check immediately
    checkReminders();

    // Then check every 30 seconds
    checkIntervalRef.current = setInterval(checkReminders, 30000);
    console.log("[JARVIS] Started reminder checks");
  }, [checkReminders]);

  const stopReminderChecks = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
      console.log("[JARVIS] Stopped reminder checks");
    }
  }, []);

  // Auto-start reminder checks if permission granted
  useEffect(() => {
    if (state.permission === "granted") {
      startReminderChecks();
    }
    return () => stopReminderChecks();
  }, [state.permission, startReminderChecks, stopReminderChecks]);

  // Clear notified reminders when a new one is added
  const clearNotifiedReminder = useCallback((id: string) => {
    notifiedRemindersRef.current.delete(id);
  }, []);

  return {
    permission: state.permission,
    isSupported: state.isSupported,
    isEnabled: state.permission === "granted",
    requestPermission,
    showNotification,
    checkReminders,
    startReminderChecks,
    stopReminderChecks,
    clearNotifiedReminder,
  };
}
