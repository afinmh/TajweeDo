import { NextResponse } from "next/server";
import { getUserProgress } from "@/db/queries";

export async function GET() {
  try {
    const up = await getUserProgress();
    if (!up) return NextResponse.json({}, { status: 200 });
    return NextResponse.json({ hearts: up.hearts ?? 0, points: up.points ?? 0 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
