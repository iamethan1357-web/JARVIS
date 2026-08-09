import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const allTasks = await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  return NextResponse.json(allTasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [task] = await db
    .insert(tasks)
    .values({
      title: body.title,
      description: body.description || null,
      priority: body.priority || "medium",
      status: body.status || "pending",
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    })
    .returning();
  return NextResponse.json(task);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [updated] = await db
    .update(tasks)
    .set({
      title: body.title,
      description: body.description,
      priority: body.priority,
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, body.id))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(tasks).where(eq(tasks.id, id));
  return NextResponse.json({ success: true });
}
