import { db } from "@/db";
import { smartDevices } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const devices = await db.select().from(smartDevices);
  return NextResponse.json(devices);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const updateData: Record<string, unknown> = {};
  if (body.status !== undefined) updateData.status = body.status;
  if (body.value !== undefined) updateData.value = body.value;
  if (body.metadata !== undefined) updateData.metadata = body.metadata;

  const [updated] = await db
    .update(smartDevices)
    .set(updateData)
    .where(eq(smartDevices.id, body.id))
    .returning();
  return NextResponse.json(updated);
}
