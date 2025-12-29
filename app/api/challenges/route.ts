import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async () => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // ✅ Optimized with sorting
        const { data, error } = await supabaseAdmin
            .from('challenges')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw error;

        const mapped = (data || []).map((ch: any) => ({
            id: ch.id,
            lessonId: ch.lesson_id,
            type: ch.type,
            question: ch.question,
            order: ch.order,
        }));

        return NextResponse.json(mapped);
    } catch (error: any) {
        return new NextResponse(error.message || "Internal error", { status: 500 });
    }
};

export const POST = async (req: Request) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        
        // ✅ Validate input
        if (!body.lessonId || !body.type || !body.question || body.order === undefined) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

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

        if (error) throw error;

        const mapped = {
            id: data.id,
            lessonId: data.lesson_id,
            type: data.type,
            question: data.question,
            order: data.order,
        };

        return NextResponse.json(mapped);
    } catch (error: any) {
        return new NextResponse(error.message || "Internal error", { status: 500 });
    }
};