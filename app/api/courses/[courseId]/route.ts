import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async (
    req: Request,
    { params }: { params: { courseId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.courseId);
    const { data, error } = await supabaseAdmin
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

    if (error && error.code !== 'PGRST116') {
        return new NextResponse(error.message, { status: 500 });
    }
    if (!data) {
        return new NextResponse("Course not found", { status: 404 });
    }

    const mapped = {
        id: data.id,
        title: data.title,
        imageSrc: data.image_src,
    };

    return NextResponse.json(mapped);
};

export const PUT = async (
    req: Request,
    { params }: { params: { courseId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.courseId);
    const body = await req.json();
    const payload = {
        title: body.title,
        image_src: body.imageSrc,
    };

    const { data, error } = await supabaseAdmin
        .from('courses')
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
        imageSrc: data.image_src,
    };

    return NextResponse.json(mapped);
};

export const DELETE = async (
    req: Request,
    { params }: { params: { courseId: number } },
) => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const id = Number(params.courseId);
    const { data, error } = await supabaseAdmin
        .from('courses')
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
        imageSrc: data.image_src,
    };

    return NextResponse.json(mapped);
};