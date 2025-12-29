import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async () => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // ✅ Direct query for admin - no need for repository overhead here
        const { data, error } = await supabaseAdmin
            .from('lessons')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw error;

        const mapped = (data || []).map((l: any) => ({
            id: l.id,
            title: l.title,
            unitId: l.unit_id,
            order: l.order,
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
        if (!body.title || !body.unitId || body.order === undefined) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

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

        if (error) throw error;

        const mapped = {
            id: data.id,
            title: data.title,
            unitId: data.unit_id,
            order: data.order,
        };

        return NextResponse.json(mapped);
    } catch (error: any) {
        return new NextResponse(error.message || "Internal error", { status: 500 });
    }
};