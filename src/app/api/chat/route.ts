import { db } from "@/db";
import {
  chatMessages,
  tasks,
  notes,
  reminders,
  smartDevices,
  automations,
} from "@/db/schema";
import { desc, eq, sql, ilike } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/ai";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Check if message is a command (vs a general question)
function isCommand(msg: string): boolean {
  const commandPatterns = [
    /^(turn|switch|set|change|adjust|dim|lock|unlock|activate|enable|disable)/i,
    /^(create|add|new|make|remove|delete|complete|finish)\s+(task|note|reminder)/i,
    /^(remind me|remember|save|store|note that)/i,
    /^(open|go to|show|navigate)/i,
    /^(status|report|system|diagnostic)/i,
    /^(good night|goodbye|bye|activate protocol)/i,
  ];
  return commandPatterns.some((p) => p.test(msg.trim()));
}

async function handleSmartHomeCommand(
  lowerMsg: string
): Promise<string | null> {
  // Turn lights on/off
  const lightMatch = lowerMsg.match(
    /turn\s+(on|off)\s+(?:the\s+)?(.+?)(?:\s+light[s]?)?$/
  );
  if (lightMatch || lowerMsg.match(/(lights?\s+(?:on|off))/)) {
    const allDevices = await db.select().from(smartDevices);

    // "Turn off all lights" / "all lights off"
    if (lowerMsg.includes("all light") || lowerMsg.includes("all the light")) {
      const newStatus = lowerMsg.includes("on") ? "on" : "off";
      const lights = allDevices.filter((d) => d.type === "light");
      for (const light of lights) {
        await db
          .update(smartDevices)
          .set({ status: newStatus })
          .where(eq(smartDevices.id, light.id));
      }
      return `Done, Sir. All ${lights.length} lights have been turned ${newStatus}. ${
        newStatus === "off"
          ? "Shall I activate night vision protocol?"
          : "The estate is now fully illuminated."
      }`;
    }

    if (lightMatch) {
      const action = lightMatch[1];
      const target = lightMatch[2].trim();
      const device = allDevices.find(
        (d) =>
          d.name.toLowerCase().includes(target) ||
          d.room.toLowerCase().includes(target)
      );
      if (device) {
        await db
          .update(smartDevices)
          .set({ status: action })
          .where(eq(smartDevices.id, device.id));
        return `${device.name} in ${device.room} is now ${action}, Sir.`;
      }
      return `I couldn't locate a device matching "${target}", Sir. Shall I scan the network again?`;
    }
  }

  // Set temperature / thermostat
  const tempMatch = lowerMsg.match(
    /(?:set|change|adjust)\s+(?:the\s+)?(?:temperature|thermostat|temp)\s+(?:to\s+)?(\d+)/
  );
  if (tempMatch) {
    const temp = parseInt(tempMatch[1]);
    const thermostats = await db
      .select()
      .from(smartDevices)
      .where(eq(smartDevices.type, "thermostat"));
    for (const t of thermostats) {
      await db
        .update(smartDevices)
        .set({ value: temp })
        .where(eq(smartDevices.id, t.id));
    }
    return `Thermostat${thermostats.length > 1 ? "s" : ""} adjusted to ${temp}°F, Sir. ${
      temp > 75
        ? "Quite warm — I trust you have your reasons."
        : temp < 65
          ? "Rather brisk. Shall I prepare some hot coffee as well?"
          : "A perfectly civilized temperature."
    }`;
  }

  // Lock / unlock
  if (
    lowerMsg.includes("lock") &&
    (lowerMsg.includes("door") || lowerMsg.includes("all"))
  ) {
    const locks = await db
      .select()
      .from(smartDevices)
      .where(eq(smartDevices.type, "lock"));
    const shouldLock = !lowerMsg.includes("unlock");
    for (const lock of locks) {
      await db
        .update(smartDevices)
        .set({ status: shouldLock ? "on" : "off" })
        .where(eq(smartDevices.id, lock.id));
    }
    return shouldLock
      ? `All doors are now secured, Sir. The perimeter is locked down.`
      : `Doors unlocked, Sir. Do exercise appropriate caution.`;
  }

  // Security / cameras
  if (lowerMsg.includes("security") || lowerMsg.includes("camera")) {
    const cameras = await db
      .select()
      .from(smartDevices)
      .where(eq(smartDevices.type, "camera"));
    const active = cameras.filter((c) => c.status === "on");
    if (
      lowerMsg.includes("activate") ||
      lowerMsg.includes("enable") ||
      lowerMsg.includes("on")
    ) {
      for (const cam of cameras) {
        await db
          .update(smartDevices)
          .set({ status: "on" })
          .where(eq(smartDevices.id, cam.id));
      }
      return `All ${cameras.length} surveillance cameras are now active, Sir. Full perimeter monitoring engaged.`;
    }
    return `Security status: ${active.length}/${cameras.length} cameras operational, Sir. All feeds nominal.`;
  }

  // Brightness
  const brightnessMatch = lowerMsg.match(
    /(?:set|change|adjust|dim)\s+(?:the\s+)?(?:brightness|lights?)\s+(?:to\s+)?(\d+)(?:\s*%)?/
  );
  if (brightnessMatch) {
    const val = parseInt(brightnessMatch[1]);
    const lights = await db
      .select()
      .from(smartDevices)
      .where(eq(smartDevices.type, "light"));
    for (const light of lights) {
      await db
        .update(smartDevices)
        .set({ value: val, status: val > 0 ? "on" : "off" })
        .where(eq(smartDevices.id, light.id));
    }
    return `All lights adjusted to ${val}% brightness, Sir.${val <= 20 ? " Setting the mood, are we?" : ""}`;
  }

  return null;
}

async function handleTaskCommand(lowerMsg: string): Promise<string | null> {
  const createMatch = lowerMsg.match(
    /(?:add|create|new|make)\s+(?:a\s+)?task\s*[:.]?\s*(.+)/
  );
  const remindMatch = lowerMsg.match(
    /(?:remind me to|i need to|add to my list)\s+(.+)/
  );
  const match = createMatch || remindMatch;

  if (match) {
    const title = match[1].trim().replace(/^\w/, (c) => c.toUpperCase());
    let priority = "medium";
    if (
      lowerMsg.includes("urgent") ||
      lowerMsg.includes("critical") ||
      lowerMsg.includes("asap")
    ) {
      priority = "critical";
    } else if (
      lowerMsg.includes("important") ||
      lowerMsg.includes("high priority")
    ) {
      priority = "high";
    } else if (
      lowerMsg.includes("low priority") ||
      lowerMsg.includes("whenever")
    ) {
      priority = "low";
    }
    await db.insert(tasks).values({ title, priority });
    return `Task created, Sir: "${title}" with ${priority} priority. I'll keep it in your queue. Anything else?`;
  }

  const completeMatch = lowerMsg.match(
    /(?:complete|finish|done with|mark done)\s+(?:task\s+)?(?:the\s+)?(.+)/
  );
  if (completeMatch) {
    const search = completeMatch[1].trim();
    const found = await db
      .select()
      .from(tasks)
      .where(ilike(tasks.title, `%${search}%`))
      .limit(1);
    if (found.length > 0) {
      await db
        .update(tasks)
        .set({ status: "completed", updatedAt: new Date() })
        .where(eq(tasks.id, found[0].id));
      return `Excellent work, Sir. Task "${found[0].title}" marked as completed. One less item on the agenda.`;
    }
    return `I couldn't find a task matching "${search}", Sir. Perhaps check the Tasks panel for the exact title?`;
  }

  return null;
}

async function handleNoteCommand(
  lowerMsg: string,
  originalMsg: string
): Promise<string | null> {
  const noteMatch = lowerMsg.match(
    /(?:remember|save|note|store|record)\s+(?:that\s+|this\s+)?(.+)/
  );
  if (noteMatch) {
    const content = originalMsg.slice(
      originalMsg.toLowerCase().indexOf(noteMatch[1])
    );
    const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
    await db.insert(notes).values({
      title,
      content,
      category: "general",
    });
    return `Stored in memory banks, Sir: "${title}". I'll keep it safe and accessible whenever you need it.`;
  }

  return null;
}

async function handleReminderCommand(lowerMsg: string): Promise<string | null> {
  const reminderMatch = lowerMsg.match(
    /(?:set|create|add)\s+(?:a\s+)?reminder\s+(?:to\s+|for\s+)?(.+)/
  );
  if (reminderMatch) {
    const title = reminderMatch[1]
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());
    const remindAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.insert(reminders).values({ title, remindAt });
    return `Reminder set, Sir: "${title}". I've scheduled it for one hour from now. You can adjust the timing in the Reminders panel.`;
  }

  return null;
}

async function handleNavigationCommand(
  lowerMsg: string
): Promise<string | null> {
  if (
    lowerMsg.includes("open task") ||
    lowerMsg.includes("go to task") ||
    lowerMsg.includes("show task")
  ) {
    return `__NAV:tasks__Navigating to Task Management, Sir. Your directives await.`;
  }
  if (
    lowerMsg.includes("open note") ||
    lowerMsg.includes("go to note") ||
    lowerMsg.includes("show note") ||
    lowerMsg.includes("memory bank")
  ) {
    return `__NAV:notes__Opening the Memory Bank, Sir.`;
  }
  if (
    lowerMsg.includes("open reminder") ||
    lowerMsg.includes("show reminder")
  ) {
    return `__NAV:reminders__Loading Temporal Alerts, Sir.`;
  }
  if (
    lowerMsg.includes("open smart") ||
    lowerMsg.includes("show device") ||
    lowerMsg.includes("show smart") ||
    lowerMsg.includes("home control")
  ) {
    return `__NAV:smarthome__Opening Smart Home Control, Sir.`;
  }
  if (
    lowerMsg.includes("open automation") ||
    lowerMsg.includes("show automation")
  ) {
    return `__NAV:automations__Loading Automation Protocols, Sir.`;
  }
  if (
    lowerMsg.includes("go home") ||
    lowerMsg.includes("go to dashboard") ||
    lowerMsg.includes("main screen") ||
    lowerMsg.includes("command center")
  ) {
    return `__NAV:dashboard__Returning to Command Center, Sir.`;
  }
  return null;
}

async function handleStatusCommand(lowerMsg: string): Promise<string | null> {
  if (
    lowerMsg.includes("status") ||
    lowerMsg.includes("report") ||
    lowerMsg.includes("diagnostic")
  ) {
    const greeting = getGreeting();
    const taskCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks);
    const pendingTasks = await db
      .select({ count: sql<number>`count(*)` })
      .from(tasks)
      .where(eq(tasks.status, "pending"));
    const activeDevices = await db
      .select({ count: sql<number>`count(*)` })
      .from(smartDevices)
      .where(eq(smartDevices.status, "on"));
    const totalDevices = await db
      .select({ count: sql<number>`count(*)` })
      .from(smartDevices);
    const activeReminders = await db
      .select({ count: sql<number>`count(*)` })
      .from(reminders)
      .where(eq(reminders.active, true));

    return `${greeting}, Sir. All systems nominal. Here's your operational summary:\n\nTasks: ${pendingTasks[0].count} pending of ${taskCount[0].count} total\nSmart Home: ${activeDevices[0].count} of ${totalDevices[0].count} devices active\nReminders: ${activeReminders[0].count} active\n\nShall I drill down into any particular area?`;
  }
  return null;
}

async function handleProtocolCommand(lowerMsg: string): Promise<string | null> {
  if (
    lowerMsg.includes("good night") ||
    lowerMsg.includes("activate") && lowerMsg.includes("night")
  ) {
    // Execute good night protocol
    const lights = await db
      .select()
      .from(smartDevices)
      .where(eq(smartDevices.type, "light"));
    const locks = await db
      .select()
      .from(smartDevices)
      .where(eq(smartDevices.type, "lock"));
    const cameras = await db
      .select()
      .from(smartDevices)
      .where(eq(smartDevices.type, "camera"));

    for (const light of lights) {
      await db
        .update(smartDevices)
        .set({ status: "off", value: 0 })
        .where(eq(smartDevices.id, light.id));
    }
    for (const lock of locks) {
      await db
        .update(smartDevices)
        .set({ status: "on" })
        .where(eq(smartDevices.id, lock.id));
    }
    for (const cam of cameras) {
      await db
        .update(smartDevices)
        .set({ status: "on" })
        .where(eq(smartDevices.id, cam.id));
    }

    return `Good night protocol activated, Sir. All ${lights.length} lights dimmed to zero. All doors locked. Security cameras engaged. Sleep well — I'll keep watch.`;
  }

  if (lowerMsg.includes("activate protocol")) {
    const allAutomations = await db.select().from(automations);
    const matching = allAutomations.find((a) =>
      lowerMsg.includes(a.name.toLowerCase())
    );
    if (matching) {
      return `Protocol "${matching.name}" acknowledged, Sir. Trigger: ${matching.trigger}. Action: ${matching.action}.`;
    }
    const names = allAutomations.map((a) => a.name).join(", ");
    return `Available protocols: ${names || "None configured"}. Which shall I activate?`;
  }

  return null;
}

async function generateJarvisResponse(message: string): Promise<string> {
  const lowerMsg = message.toLowerCase().trim();

  // 1. Try command handlers first (smart home, tasks, etc.)
  if (isCommand(lowerMsg)) {
    const smartHomeResponse = await handleSmartHomeCommand(lowerMsg);
    if (smartHomeResponse) return smartHomeResponse;

    const taskResponse = await handleTaskCommand(lowerMsg);
    if (taskResponse) return taskResponse;

    const noteResponse = await handleNoteCommand(lowerMsg, message);
    if (noteResponse) return noteResponse;

    const reminderResponse = await handleReminderCommand(lowerMsg);
    if (reminderResponse) return reminderResponse;

    const navResponse = await handleNavigationCommand(lowerMsg);
    if (navResponse) return navResponse;

    const statusResponse = await handleStatusCommand(lowerMsg);
    if (statusResponse) return statusResponse;

    const protocolResponse = await handleProtocolCommand(lowerMsg);
    if (protocolResponse) return protocolResponse;
  }

  // 2. Also check status/navigation even if not strictly a "command"
  const statusResponse = await handleStatusCommand(lowerMsg);
  if (statusResponse) return statusResponse;

  const navResponse = await handleNavigationCommand(lowerMsg);
  if (navResponse) return navResponse;

  // 3. For general questions, use AI
  // Fetch recent conversation history for context
  const recentMessages = await db
    .select()
    .from(chatMessages)
    .orderBy(desc(chatMessages.createdAt))
    .limit(10);

  const history = recentMessages.reverse().map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Generate AI response for general questions
  return await generateAIResponse(message, history);
}

export async function GET() {
  const messages = await db
    .select()
    .from(chatMessages)
    .orderBy(desc(chatMessages.createdAt))
    .limit(50);
  return NextResponse.json(messages.reverse());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const userMessage = body.message;

  // Save user message
  await db.insert(chatMessages).values({
    role: "user",
    content: userMessage,
  });

  // Generate JARVIS response
  const response = await generateJarvisResponse(userMessage);

  // Extract navigation command if present
  let cleanResponse = response;
  let navTarget: string | null = null;
  const navMatch = response.match(/__NAV:(\w+)__/);
  if (navMatch) {
    navTarget = navMatch[1];
    cleanResponse = response.replace(/__NAV:\w+__/, "");
  }

  // Save assistant message
  const [assistantMsg] = await db
    .insert(chatMessages)
    .values({
      role: "assistant",
      content: cleanResponse,
    })
    .returning();

  return NextResponse.json({
    ...assistantMsg,
    navTarget,
  });
}

export async function DELETE() {
  await db.delete(chatMessages);
  return NextResponse.json({ success: true });
}
