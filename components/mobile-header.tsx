"use client";

import Link from "next/link"
import Image from "next/image"
import { InfinityIcon } from "lucide-react"

type Props = {
    points?: number;
    hearts?: number;
};

export const MobileHeader = ({ points = 0, hearts = 0 }: Props) => {
    const isPro = false;

    return (
        <nav className="lg:hidden px-4 h-[60px] flex items-center justify-between bg-emerald-400 border-b fixed top-0 w-full z-50">
            <Link href="/" className="flex items-center gap-2">
                <Image src="/mascot.svg" width={28} height={28} alt="Mascot" />
                <span className="text-white font-extrabold tracking-wide text-lg">TajweeDo</span>
            </Link>

            <div className="flex items-center gap-5">
                <Link href="/shop" className="text-orange-500 flex items-center font-bold">
                    <Image src="/points.svg" height={22} width={22} alt="Points" className="mr-1" />
                    <span className="text-white/90">{points}</span>
                </Link>
                <Link href="/shop" className="text-rose-500 flex items-center font-bold">
                    <Image src="/heart.svg" height={20} width={20} alt="Hearts" className="mr-1" />
                    <span className="text-white/90">
                        {isPro ? <InfinityIcon className="h-4 w-4 stroke-[3] inline align-middle" /> : hearts}
                    </span>
                </Link>
            </div>
        </nav>
    )
}