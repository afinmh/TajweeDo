import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async () => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from('courses')
        .select('*');

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }

    const mapped = (data || []).map((c: any) => ({
        id: c.id,
        title: c.title,
        imageSrc: c.image_src,
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
        image_src: body.imageSrc,
    };

    const { data, error } = await supabaseAdmin
        .from('courses')
        .insert(payload)
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