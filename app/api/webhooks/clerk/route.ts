import { NextResponse } from "next/server";

// This endpoint listens for Clerk webhooks (user.created) and sets a default
// avatar URL (public/profile.svg) by calling the Clerk REST API using
// CLERK_SECRET_KEY. For production you should verify the webhook signature.
export async function POST(req: Request) {
    const raw = await req.text();

    let evt: any;
    try {
        evt = JSON.parse(raw);
    } catch (err) {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // Basic check for event type
    if (evt?.type !== "user.created") {
        return NextResponse.json({ received: true });
    }

    const userId = evt.data?.id || evt.data?.user?.id;
    if (!userId) {
        return NextResponse.json({ error: "No user id in event" }, { status: 400 });
    }

    const clerkKey = process.env.CLERK_SECRET_KEY;
    if (!clerkKey) {
        return NextResponse.json({ error: "CLERK_SECRET_KEY not configured" }, { status: 500 });
    }

    // Build absolute URL to /profile.svg; prefer NEXT_PUBLIC_SITE_URL
    const site = process.env.NEXT_PUBLIC_SITE_URL || `${req.headers.get("x-forwarded-proto") || "https"}://${req.headers.get("host")}`;
    const avatarUrl = `${site.replace(/\/$/, "")}/profile.svg`;

    try {
        const res = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${clerkKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ profile_image_url: avatarUrl }),
        });

        if (!res.ok) {
            const text = await res.text();
            console.error("Clerk API error", res.status, text);
        }
    } catch (err) {
        console.error("Failed to call Clerk API", err);
    }

    return NextResponse.json({ received: true });
}
