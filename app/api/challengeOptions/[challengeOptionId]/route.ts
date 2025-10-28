import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async (
    req: Request,
    { params }: { params: { challengeOptionId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.challengeOptionId);
    const { data, error } = await supabaseAdmin
        .from('challenge_options')
        .select('*')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') {
        return new NextResponse(error.message, { status: 500 });
    }
    if (!data) {
        return new NextResponse("Challenge option not found", { status: 404 });
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

export const PUT = async (
    req: Request,
    { params }: { params: { challengeOptionId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.challengeOptionId);
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
        .update(payload)
        .eq('id', id)
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

export const DELETE = async (
    req: Request,
    { params }: { params: { challengeOptionId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.challengeOptionId);
    const { data, error } = await supabaseAdmin
        .from('challenge_options')
        .delete()
        .eq('id', id)
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