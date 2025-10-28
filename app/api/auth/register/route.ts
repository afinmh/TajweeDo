import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  const body = await req.json();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password || password.length < 6) {
    return NextResponse.json({ error: "invalid_input" }, { status: 400 });
  }

  const { data: existing, error: existingErr } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (existingErr) {
    return NextResponse.json({ error: "db_error", details: existingErr.message }, { status: 500 });
  }
  if (existing) {
    return NextResponse.json({ error: "username_taken" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  const { error: insErr } = await supabaseAdmin.from('users').insert({
    id,
    username,
    password_hash: hash,
    role: 'user',
    profile_image_src: '/standar.png',
  });
  if (insErr) {
    return NextResponse.json({ error: 'db_error', details: insErr.message }, { status: 500 });
  }

  // Auto-grant all profile items to new users
  try {
    const { data: profileItems } = await supabaseAdmin
      .from('store_items')
      .select('id')
      .eq('item_type', 'profile')
      .eq('active', true);
    if (profileItems && profileItems.length) {
      await supabaseAdmin
        .from('user_purchases')
        .insert(profileItems.map((it: any) => ({ user_id: id, item_id: it.id })));
    }
  } catch (e) {
    // swallow non-critical errors; user creation should still succeed
  }

  const token = jwt.sign({ userId: id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

  const res = NextResponse.json({ ok: true, userId: id }, { status: 201 });
  const cookie = `token=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  res.headers.set('Set-Cookie', cookie);

  return res;
}
