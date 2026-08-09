import { db } from "@/db";
import { reminders } from "@/db/schema";
import { eq, lte, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  
  // Get reminders that are due (remind_at <= now) and still active
  const dueReminders = await db
    .select()
    .from(reminders)
    .where(
      and(
        eq(reminders.active, true),
        lte(reminders.remindAt, now)
      )
    );

  return NextResponse.json(dueReminders);
}
