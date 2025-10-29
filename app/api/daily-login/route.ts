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
    .select('last_login_date, current_streak, best_streak, total_logins, status, view')
    .eq('user_id', userId)
    .maybeSingle();

  // If already claimed today, return idempotent
  if (streak?.last_login_date === todayStr && streak?.status) {
    const priorTotal = streak?.total_logins || 0;
    const dayIndex = ((priorTotal - 1) % 30) + 1;
    return NextResponse.json({
      status: 'already_claimed',
      day: dayIndex,
      currentStreak: streak?.current_streak || 0,
      bestStreak: streak?.best_streak || 0,
      totalLogins: priorTotal,
    });
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
      status: true,
      // Keep view flag as-is (don't force change on claim)
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

// GET: returns rewards and user's daily login state; also resets state for a new day (status=false, view=false)
export const GET = async (req: Request) => {
  // Always return rewards for the client grid
  let rewards: any[] = [];
  try {
    const { data } = await supabaseAdmin
      .from('daily_login_rewards')
      .select('day, points, item_id')
      .order('day', { ascending: true });
    rewards = data || [];
  } catch {
    rewards = [];
  }

  // If user not logged in, only return rewards
  const userId = getUserIdFromCookie(req);
  if (!userId) return NextResponse.json({ rewards });

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // Ensure user row exists
  const { data: dl } = await supabaseAdmin
    .from('user_daily_login')
    .select('last_login_date, current_streak, best_streak, total_logins, status, view')
    .eq('user_id', userId)
    .maybeSingle();

  type StreakState = {
    last_login_date: string;
    current_streak: number;
    best_streak: number;
    total_logins: number;
    status: boolean;
    view: boolean;
  };

  let state: StreakState;
  if (!dl) {
    // Initialize so today is considered not claimed and modal can show
    await supabaseAdmin.from('user_daily_login').insert({
      user_id: userId,
      last_login_date: yesterdayStr,
      current_streak: 0,
      best_streak: 0,
      total_logins: 0,
      status: false,
      view: false,
    });
    state = {
      last_login_date: yesterdayStr,
      current_streak: 0,
      best_streak: 0,
      total_logins: 0,
      status: false,
      view: false,
    };
  } else {
    state = dl as StreakState;
  }

  // New day: reset status/view so claim becomes available
  if (state.last_login_date !== todayStr && (state.status || state.view)) {
    await supabaseAdmin
      .from('user_daily_login')
      .update({ status: false, view: false })
      .eq('user_id', userId);
    state.status = false;
    state.view = false;
  }

  // Determine the day index to claim
  const totalLogins = state.total_logins || 0;
  const alreadyClaimedToday = state.last_login_date === todayStr && state.status;
  const dayIndex = alreadyClaimedToday
    ? ((totalLogins - 1) % 30) + 1
    : (totalLogins % 30) + 1;

  const { data: reward } = await supabaseAdmin
    .from('daily_login_rewards')
    .select('day, points, item_id')
    .eq('day', dayIndex)
    .maybeSingle();

  const shouldOpen = (state.last_login_date !== todayStr) && !state.view;

  return NextResponse.json({
    rewards,
    state: {
      show: shouldOpen,
      status: !!state.status,
      view: !!state.view,
      last_login_date: state.last_login_date,
      currentStreak: state.current_streak || 0,
      bestStreak: state.best_streak || 0,
      totalLogins: totalLogins,
      day: dayIndex,
      reward,
    }
  });
};

// PATCH: update view flag (e.g., hide modal today)
export const PATCH = async (req: Request) => {
  const userId = getUserIdFromCookie(req);
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { view } = body || {};
  if (typeof view !== 'boolean') {
    return new NextResponse("Bad Request", { status: 400 });
  }

  await supabaseAdmin
    .from('user_daily_login')
    .update({ view })
    .eq('user_id', userId);

  return NextResponse.json({ ok: true, view });
};
