import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = m?.[1];

  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  try {
  const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = payload.userId as string;
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, username, profile_image_src, role')
      .eq('id', userId)
      .maybeSingle();
  if (error) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    return NextResponse.json({ id: user.id, username: user.username, profileImageSrc: user.profile_image_src, role: user.role });
  } catch (err) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
}
