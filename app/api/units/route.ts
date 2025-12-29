import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { supabaseAdmin } from "@/lib/supabase";

export const GET = async () => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // ✅ Optimized with sorting for better UX
        const { data, error } = await supabaseAdmin
            .from('units')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw error;

        const mapped = (data || []).map((u: any) => ({
            id: u.id,
            title: u.title,
            description: u.description,
            courseId: u.course_id,
            order: u.order,
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
        if (!body.title || !body.courseId || body.order === undefined) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const payload = {
            title: body.title,
            description: body.description || '',
            course_id: body.courseId,
            order: body.order,
        };

        const { data, error } = await supabaseAdmin
            .from('units')
            .insert(payload)
            .select('*')
            .single();

        if (error) throw error;

        const mapped = {
            id: data.id,
            title: data.title,
            description: data.description,
            courseId: data.course_id,
            order: data.order,
        };

        return NextResponse.json(mapped);
    } catch (error: any) {
        return new NextResponse(error.message || "Internal error", { status: 500 });
    }
};