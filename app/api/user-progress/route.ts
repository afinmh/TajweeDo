import { NextResponse } from "next/server";
import { userProgressService } from "@/lib/services";

export async function GET() {
  try {
    // ✅ Use service layer for business logic
    const userProgress = await userProgressService.getCurrentUserProgress();
    
    if (!userProgress) {
      return NextResponse.json({ hearts: 0, points: 0 }, { status: 200 });
    }
    
    return NextResponse.json({ 
      hearts: userProgress.hearts ?? 0, 
      points: userProgress.points ?? 0,
      xp: userProgress.xp ?? 0,
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ hearts: 0, points: 0 }, { status: 200 });
  }
}
