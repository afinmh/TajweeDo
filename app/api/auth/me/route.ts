import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = m?.[1];

  if (!token) return NextResponse.json(null);

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = payload.userId as string;
    if (!userId) return NextResponse.json(null);

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, username, profile_image_src, role')
      .eq('id', userId)
      .maybeSingle();
    if (error) return NextResponse.json(null);
    if (!user) return NextResponse.json(null);

    return NextResponse.json({ id: user.id, username: user.username, profileImageSrc: user.profile_image_src, role: user.role });
  } catch (err) {
    return NextResponse.json(null);
  }
}
