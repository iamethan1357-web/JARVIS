import { db } from "@/db";
import { reminders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(reminders).orderBy(desc(reminders.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [reminder] = await db
    .insert(reminders)
    .values({
      title: body.title,
      description: body.description || null,
      remindAt: new Date(body.remindAt),
      recurring: body.recurring || null,
      active: body.active !== undefined ? body.active : true,
    })
    .returning();
  return NextResponse.json(reminder);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [updated] = await db
    .update(reminders)
    .set({
      title: body.title,
      description: body.description,
      remindAt: body.remindAt ? new Date(body.remindAt) : undefined,
      recurring: body.recurring,
      active: body.active,
    })
    .where(eq(reminders.id, body.id))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(reminders).where(eq(reminders.id, id));
  return NextResponse.json({ success: true });
}
