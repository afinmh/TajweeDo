import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select('id, username, password_hash')
    .eq('username', username)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: "db_error", details: error.message }, { status: 500 });
  }
  if (!user || !user.password_hash) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

  const res = NextResponse.json({ ok: true, userId: user.id });
  const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  res.headers.set('Set-Cookie', cookie);

  return res;
}
