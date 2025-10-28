import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
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

export const POST = async (req: Request) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const { itemId, equip } = await req.json();
  const id = Number(itemId);
  if (!id) return new NextResponse("Invalid itemId", { status: 400 });

  // Load item
  const { data: item, error: itemErr } = await supabaseAdmin
    .from('store_items')
    .select('id, price_points, image_src, active')
    .eq('id', id)
    .maybeSingle();
  if (itemErr || !item || !item.active) return new NextResponse("Item not available", { status: 404 });

  // Already purchased?
  const { data: existing } = await supabaseAdmin
    .from('user_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('item_id', id)
    .maybeSingle();
  if (existing) return NextResponse.json({ status: 'already-owned' });

  // Load points
  const { data: up } = await supabaseAdmin
    .from('user_progress')
    .select('points')
    .eq('user_id', userId)
    .maybeSingle();
  const points = up?.points || 0;
  if (points < item.price_points) {
    return NextResponse.json({ status: 'insufficient-points' }, { status: 400 });
  }

  // Deduct points and insert purchase
  await supabaseAdmin
    .from('user_progress')
    .update({ points: points - item.price_points })
    .eq('user_id', userId);

  await supabaseAdmin
    .from('user_purchases')
    .insert({ user_id: userId, item_id: id });

  if (equip) {
    await supabaseAdmin
      .from('users')
      .update({ profile_image_src: item.image_src })
      .eq('id', userId);
  }

  return NextResponse.json({ status: 'purchased', newPoints: points - item.price_points });
};
