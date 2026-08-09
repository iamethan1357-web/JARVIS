import { db } from "@/db";
import { notes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const allNotes = await db.select().from(notes).orderBy(desc(notes.pinned), desc(notes.createdAt));
  return NextResponse.json(allNotes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [note] = await db
    .insert(notes)
    .values({
      title: body.title,
      content: body.content,
      category: body.category || "general",
      pinned: body.pinned || false,
    })
    .returning();
  return NextResponse.json(note);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [updated] = await db
    .update(notes)
    .set({
      title: body.title,
      content: body.content,
      category: body.category,
      pinned: body.pinned,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, body.id))
    .returning();
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.delete(notes).where(eq(notes.id, id));
  return NextResponse.json({ success: true });
}
