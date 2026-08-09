import { db } from "@/db";
import { automations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(automations).orderBy(desc(automations.createdAt));
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [automation] = await db
    .insert(automations)
    .values({
      name: body.name,
      trigger: body.trigger,
      action: body.action,
      active: body.active !== undefined ? body.active : true,
    })
    .returning();
  return NextResponse.json(automation);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [updated] = await db
    .update(automations)
    .set({
      name: body.name,
      trigger: body.trigger,
      action: body.action,
      active: body.active,
    })
    .where(eq(automations.id, body.id))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(automations).where(eq(automations.id, id));
  return NextResponse.json({ success: true });
}
