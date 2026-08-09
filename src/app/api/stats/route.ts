import { db } from "@/db";
import { tasks, notes, reminders, smartDevices, automations } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const [taskStats] = await db.select({
    total: sql<number>`count(*)`,
    pending: sql<number>`count(*) filter (where ${tasks.status} = 'pending')`,
    inProgress: sql<number>`count(*) filter (where ${tasks.status} = 'in_progress')`,
    completed: sql<number>`count(*) filter (where ${tasks.status} = 'completed')`,
  }).from(tasks);

  const [noteStats] = await db.select({
    total: sql<number>`count(*)`,
  }).from(notes);

  const [reminderStats] = await db.select({
    total: sql<number>`count(*)`,
    active: sql<number>`count(*) filter (where ${reminders.active} = true)`,
  }).from(reminders);

  const [deviceStats] = await db.select({
    total: sql<number>`count(*)`,
    active: sql<number>`count(*) filter (where ${smartDevices.status} = 'on')`,
  }).from(smartDevices);

  const [automationStats] = await db.select({
    total: sql<number>`count(*)`,
    active: sql<number>`count(*) filter (where ${automations.active} = true)`,
  }).from(automations);

  return NextResponse.json({
    tasks: taskStats,
    notes: noteStats,
    reminders: reminderStats,
    devices: deviceStats,
    automations: automationStats,
    systemTime: new Date().toISOString(),
    systemStatus: "operational",
  });
}
