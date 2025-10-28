import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async (
    req: Request,
    { params }: { params: { challengeId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.challengeId);
    const { data, error } = await supabaseAdmin
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') {
        return new NextResponse(error.message, { status: 500 });
    }
    if (!data) {
        return new NextResponse("Challenge not found", { status: 404 });
    }

    const mapped = {
        id: data.id,
        lessonId: data.lesson_id,
        type: data.type,
        question: data.question,
        order: data.order,
    };

    return NextResponse.json(mapped);
};

export const PUT = async (
    req: Request,
    { params }: { params: { challengeId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.challengeId);
    const body = await req.json();
    const payload = {
        lesson_id: body.lessonId,
        type: body.type,
        question: body.question,
        order: body.order,
    };

    const { data, error } = await supabaseAdmin
        .from('challenges')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }

    const mapped = {
        id: data.id,
        lessonId: data.lesson_id,
        type: data.type,
        question: data.question,
        order: data.order,
    };

    return NextResponse.json(mapped);
};

export const DELETE = async (
    req: Request,
    { params }: { params: { challengeId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.challengeId);
    const { data, error } = await supabaseAdmin
        .from('challenges')
        .delete()
        .eq('id', id)
        .select('*')
        .single();

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }

    const mapped = {
        id: data.id,
        lessonId: data.lesson_id,
        type: data.type,
        question: data.question,
        order: data.order,
    };

    return NextResponse.json(mapped);
};