import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Expire cookie defensively with Max-Age=0 and past Expires
  const cookie = `token=; HttpOnly; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`;
  res.headers.set('Set-Cookie', cookie);
  // Add headers to discourage caching responses that might have been cached by a SW previously
  res.headers.set('Cache-Control', 'no-store');
  return res;
}
