import { NextResponse } from "next/server";

import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async () => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { data, error } = await supabaseAdmin
        .from('lessons')
        .select('*');

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }

    const mapped = (data || []).map((l: any) => ({
        id: l.id,
        title: l.title,
        unitId: l.unit_id,
        order: l.order,
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
        unit_id: body.unitId,
        order: body.order,
    };

    const { data, error } = await supabaseAdmin
        .from('lessons')
        .insert(payload)
        .select('*')
        .single();

    if (error) {
        return new NextResponse(error.message, { status: 500 });
    }

    const mapped = {
        id: data.id,
        title: data.title,
        unitId: data.unit_id,
        order: data.order,
    };

    return NextResponse.json(mapped);
};