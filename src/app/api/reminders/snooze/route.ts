import { db } from "@/db";
import { reminders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, minutes = 10 } = body;

  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const newRemindAt = new Date(Date.now() + minutes * 60 * 1000);

  const [updated] = await db
    .update(reminders)
    .set({ remindAt: newRemindAt })
    .where(eq(reminders.id, id))
    .returning();

  return NextResponse.json(updated);
}
