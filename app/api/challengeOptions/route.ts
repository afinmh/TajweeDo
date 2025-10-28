import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async () => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from('challenge_options')
        .select('*');

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }

    const mapped = (data || []).map((o: any) => ({
        id: o.id,
        challengeId: o.challenge_id,
        text: o.text,
        correct: o.correct,
        imageSrc: o.image_src,
        audioSrc: o.audio_src,
    }));

    return NextResponse.json(mapped);
};

export const POST = async (req: Request) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const payload = {
        challenge_id: body.challengeId,
        text: body.text,
        correct: body.correct,
        image_src: body.imageSrc ?? null,
        audio_src: body.audioSrc ?? null,
    };

    const { data, error } = await supabaseAdmin
        .from('challenge_options')
        .insert(payload)
        .select('*')
        .single();

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }

    const mapped = {
        id: data.id,
        challengeId: data.challenge_id,
        text: data.text,
        correct: data.correct,
        imageSrc: data.image_src,
        audioSrc: data.audio_src,
    };

    return NextResponse.json(mapped);
};