import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

function getUserIdFromCookie(req: Request): string | null {
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|; )token=([^;]+)/);
  const token = m?.[1];
  if (!token) return null;
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET as string);
    return (payload?.userId as string) || null;
  } catch {
    return null;
  }
}

export const GET = async (req: Request) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  // Fetch user and purchases in parallel
  const [{ data: user }, { data: purchases }] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, username, profile_image_src')
      .eq('id', userId)
      .maybeSingle(),
    supabaseAdmin
      .from('user_purchases')
      .select('item_id')
      .eq('user_id', userId),
  ]);
  const ids = (purchases || []).map((p: any) => p.item_id);
  let owned: any[] = [];
  if (ids.length) {
    const { data: items } = await supabaseAdmin
      .from('store_items')
      .select('id, name, image_src, active')
      .in('id', ids)
      .eq('active', true);
    owned = (items || []).filter((i: any) => !!i.image_src);
  }

  return NextResponse.json({
    user: user || null,
    ownedAvatars: owned || [],
  });
};

export const PATCH = async (req: Request) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();
  const username: string | undefined = body.username?.trim();
  const password: string | undefined = body.password;
  const imageSrc: string | undefined = body.imageSrc;

  // Validate image ownership if provided (accept any purchased, active item)
  if (imageSrc) {
    const { data: item } = await supabaseAdmin
      .from('store_items')
      .select('id, active')
      .eq('image_src', imageSrc)
      .maybeSingle();
    if (!item || !item.id || !item.active) {
      return NextResponse.json({ error: 'not_owned' }, { status: 400 });
    }
    const { data: own } = await supabaseAdmin
      .from('user_purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('item_id', item.id)
      .maybeSingle();
    if (!own) {
      return NextResponse.json({ error: 'not_owned' }, { status: 400 });
    }
  }

  // If username provided, ensure uniqueness
  if (username) {
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: 'username_taken' }, { status: 409 });
    }
  }

  // Build updates
  const userUpdate: any = {};
  if (username) userUpdate.username = username;
  if (imageSrc) userUpdate.profile_image_src = imageSrc;
  if (password && password.length >= 6) {
    userUpdate.password_hash = await bcrypt.hash(password, 10);
  }

  if (Object.keys(userUpdate).length) {
    await supabaseAdmin.from('users').update(userUpdate).eq('id', userId);
  }

  // Mirror changes into user_progress
  const progressUpdate: any = {};
  if (username) progressUpdate.user_name = username;
  if (imageSrc) progressUpdate.user_image_src = imageSrc;
  if (Object.keys(progressUpdate).length) {
    // Ensure row exists
    await supabaseAdmin
      .from('user_progress')
      .upsert({ user_id: userId, ...progressUpdate }, { onConflict: 'user_id' });
  }

  return NextResponse.json({ ok: true });
};
