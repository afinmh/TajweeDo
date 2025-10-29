import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cookies } from "next/headers";
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

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Ensure user_progress row exists
  const { data: prof } = await supabaseAdmin
    .from('users')
    .select('username, profile_image_src')
    .eq('id', userId)
    .maybeSingle();
  const { data: up } = await supabaseAdmin
    .from('user_progress')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (!up) {
    await supabaseAdmin.from('user_progress').insert({
      user_id: userId,
      user_name: prof?.username || 'User',
      user_image_src: prof?.profile_image_src || '/standar.png',
      hearts: 5,
      points: 0,
    });
  }

  // Load user_daily_login
  const { data: streak } = await supabaseAdmin
    .from('user_daily_login')
    .select('last_login_date, current_streak, best_streak, total_logins')
    .eq('user_id', userId)
    .maybeSingle();

  if (streak?.last_login_date === todayStr) {
    const priorTotal = streak?.total_logins || 0;
    const dayIndex = ((priorTotal - 1) % 30) + 1;
    return NextResponse.json({ status: 'already_claimed', day: dayIndex, currentStreak: streak?.current_streak || 0, bestStreak: streak?.best_streak || 0, totalLogins: priorTotal });
  }

  const isConsecutive = streak?.last_login_date === yesterdayStr;
  const currentStreak = isConsecutive ? (streak?.current_streak || 0) + 1 : 1;
  const bestStreak = Math.max(streak?.best_streak || 0, currentStreak);
  const totalLogins = (streak?.total_logins || 0) + 1;

  // Day index 1..30
  const dayIndex = ((totalLogins - 1) % 30) + 1;

  // Fetch reward
  const { data: reward } = await supabaseAdmin
    .from('daily_login_rewards')
    .select('day, points, item_id')
    .eq('day', dayIndex)
    .maybeSingle();

  // Apply points reward
  if (reward?.points) {
    await supabaseAdmin
      .from('user_progress')
      .update({ points: (await (async () => {
        const { data } = await supabaseAdmin
          .from('user_progress')
          .select('points')
          .eq('user_id', userId)
          .maybeSingle();
        return (data?.points || 0) + (reward.points || 0);
      })()) })
      .eq('user_id', userId);
  }

  // Grant item reward if exists
  if (reward?.item_id) {
    await supabaseAdmin
      .from('user_purchases')
      .insert({ user_id: userId, item_id: reward.item_id })
      .select('*')
      .maybeSingle();
  }

  // Upsert streak row
  await supabaseAdmin
    .from('user_daily_login')
    .upsert({
      user_id: userId,
      last_login_date: todayStr,
      current_streak: currentStreak,
      best_streak: bestStreak,
      total_logins: totalLogins,
    }, { onConflict: 'user_id' });

  return NextResponse.json({
    status: 'claimed',
    day: dayIndex,
    reward,
    currentStreak,
    bestStreak,
    totalLogins,
  });
};

// Public: return the full daily rewards table so the client can render badges/tooltips
export const GET = async () => {
  try {
    const { data } = await supabaseAdmin
      .from('daily_login_rewards')
      .select('day, points, item_id')
      .order('day', { ascending: true });

    return NextResponse.json({ rewards: data || [] });
  } catch (err) {
    return NextResponse.json({ rewards: [] });
  }
};
