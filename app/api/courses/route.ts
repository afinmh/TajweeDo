import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { courseRepository } from "@/lib/repositories";

export const GET = async () => {
    if (!isAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        // ✅ Use repository for data access
        const courses = await courseRepository.findAll();
        return NextResponse.json(courses);
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
        
        // ✅ Use repository for data access
        const course = await courseRepository.create(body.title, body.imageSrc);
        
        if (!course) {
            return new NextResponse("Failed to create course", { status: 500 });
        }
        
        return NextResponse.json(course);
    } catch (error: any) {
        return new NextResponse(error.message || "Internal error", { status: 500 });
    }
};