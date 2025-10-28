import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async () => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from('units')
        .select('*');

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }

    const mapped = (data || []).map((u: any) => ({
        id: u.id,
        title: u.title,
        description: u.description,
        courseId: u.course_id,
        order: u.order,
    }));

    return NextResponse.json(mapped);
};

export const POST = async (req: Request) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const payload = {
        title: body.title,
        description: body.description,
        course_id: body.courseId,
        order: body.order,
    };

    const { data, error } = await supabaseAdmin
        .from('units')
        .insert(payload)
        .select('*')
        .single();

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }

    const mapped = {
        id: data.id,
        title: data.title,
        description: data.description,
        courseId: data.course_id,
        order: data.order,
    };

    return NextResponse.json(mapped);
};