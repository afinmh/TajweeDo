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

export const GET = async (req: Request) => {
  const userId = getUserIdFromCookie(req);

  const { data: items, error } = await supabaseAdmin
    .from('store_items')
    .select('id, name, image_src, price_points, item_type, active')
    .eq('active', true)
    .order('id', { ascending: true });
  if (error) return new NextResponse(error.message, { status: 500 });

  if (!items) return NextResponse.json([]);

  let purchasedIds: number[] = [];
  if (userId) {
    const { data: purchases } = await supabaseAdmin
      .from('user_purchases')
      .select('item_id')
      .eq('user_id', userId);
    purchasedIds = (purchases || []).map(p => p.item_id);
  }

  const mapped = items.map(i => ({
    id: i.id,
    name: i.name,
    imageSrc: i.image_src,
    pricePoints: i.price_points,
    itemType: i.item_type,
    purchased: purchasedIds.includes(i.id),
  }));

  return NextResponse.json(mapped);
};
