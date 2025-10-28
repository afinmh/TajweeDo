import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async () => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from('challenges')
        .select('*');

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }

    const mapped = (data || []).map((ch: any) => ({
        id: ch.id,
        lessonId: ch.lesson_id,
        type: ch.type,
        question: ch.question,
        order: ch.order,
    }));

    return NextResponse.json(mapped);
};

export const POST = async (req: Request) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const payload = {
        lesson_id: body.lessonId,
        type: body.type,
        question: body.question,
        order: body.order,
    };

    const { data, error } = await supabaseAdmin
        .from('challenges')
        .insert(payload)
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