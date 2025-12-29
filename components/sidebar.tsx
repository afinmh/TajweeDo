"use client"

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-item";

import { Button } from "./ui/button";
import AuthEntry from "./auth-entry";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
    className?: string;
};

export const Sidebar = ({ className }: Props) => {
    const router = useRouter();

    // Proactively prefetch primary routes once on mount to make first navigation instant
    useEffect(() => {
        const routes = ["/learn", "/leaderboard", "/quests", "/shop", "/(main)/account", "/account", "/lesson"];
        routes.forEach((r) => {
            try { (router as any).prefetch?.(r); } catch {}
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {/* Desktop sidebar (visible on lg and up) */}
            <div className={cn(
                "hidden lg:flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col",
                className,
            )}>
            <Link href="/learn" prefetch>
                <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
                    <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
                    <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
                        TajweDo
                    </h1>
                </div>
            </Link>
            <div className="flex flex-col gap-y-2 flex-1">
                <SidebarItem
                    label="Learn"
                    href="/learn"
                    iconSrc="/learn.svg"
                />
                <SidebarItem
                    label="Leaderboard"
                    href="/leaderboard"
                    iconSrc="/leaderboard.svg"
                />
                <SidebarItem
                    label="Doa"
                    href="/quests"
                    iconSrc="/puzzle.png"
                />
                <SidebarItem
                    label="shop"
                    href="/shop"
                    iconSrc="/shop.svg"
                />
            </div>
            <div className="p-4">
                <AuthEntry variant="button" />
            </div>
            </div>

            {/* Mobile bottom navbar (visible below lg) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 z-40">
                <div className="max-w-screen-lg mx-auto flex items-center justify-between px-4 py-2">
                    <Link href="/learn" prefetch aria-label="Belajar" className="flex items-center text-slate-700">
                        <Image src="/learn.svg" alt="Learn" width={28} height={28} />
                    </Link>
                    <Link href="/leaderboard" prefetch aria-label="Papan" className="flex items-center text-slate-700">
                        <Image src="/leaderboard.svg" alt="Leaderboard" width={28} height={28} />
                    </Link>
                    <Link href="/quests" prefetch aria-label="Doa" className="flex items-center text-slate-700">
                        <Image src="/puzzle.png" alt="Doa" width={28} height={28} />
                    </Link>
                    <Link href="/shop" prefetch aria-label="Toko" className="flex items-center text-slate-700">
                        <Image src="/shop.svg" alt="Shop" width={28} height={28} />
                    </Link>
                    <div className="flex items-center text-slate-700">
                        <AuthEntry variant="compact" />
                    </div>
                </div>
            </nav>
        </>
    );
};