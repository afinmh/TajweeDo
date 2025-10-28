import { NextResponse } from "next/server";

// Clerk removed. Keep a lightweight no-op middleware so matcher config remains.
export function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/(api|trpc)(.*)"
  ]
};