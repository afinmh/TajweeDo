"use client";

import { usePrefetchRoutes } from "@/lib/utils/route-prefetch";

type Props = {
    children: React.ReactNode;
};

export const ClientLayout = ({ children }: Props) => {
    // Prefetch all common routes for instant navigation
    usePrefetchRoutes();

    return <>{children}</>;
};
