import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async (
    req: Request,
    { params }: { params: { unitId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.unitId);
    const { data, error } = await supabaseAdmin
        .from('units')
        .select('*')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') {
        return new NextResponse(error.message, { status: 500 });
    }
    if (!data) {
        return new NextResponse("Unit not found", { status: 404 });
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

export const PUT = async (
    req: Request,
    { params }: { params: { unitId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.unitId);
    const body = await req.json();
    const payload = {
        title: body.title,
        description: body.description,
        course_id: body.courseId,
        order: body.order,
    };

    const { data, error } = await supabaseAdmin
        .from('units')
        .update(payload)
        .eq('id', id)
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

export const DELETE = async (
    req: Request,
    { params }: { params: { unitId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.unitId);
    const { data, error } = await supabaseAdmin
        .from('units')
        .delete()
        .eq('id', id)
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