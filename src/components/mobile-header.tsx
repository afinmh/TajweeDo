import { Link } from "react-router-dom";
import { InfinityIcon } from "lucide-react";

type Props = {
    points?: number;
    hearts?: number;
    xp?: number;
};

export const MobileHeader = ({ points = 0, hearts = 0, xp = 0 }: Props) => {
    const isPro = false;

    const formatNumber = (num: number) => {
        if (num >= 10000) return `${Math.floor(num / 1000)}k`;
        return num;
    };

    return (
        <nav className="lg:hidden px-3 sm:px-4 h-[60px] flex items-center justify-between bg-emerald-400 border-b fixed top-0 w-full z-50">
            <Link to="/" className="flex items-center gap-2 shrink-0">
                <img src="/mascot.svg" width={28} height={28} alt="Mascot" />
                <span className="text-white font-extrabold tracking-wide text-base sm:text-lg">TajweeDo</span>
            </Link>

            <div className="flex items-center gap-3 sm:gap-5 shrink-0 text-sm sm:text-base">
                <Link to="/shop" className="text-blue-500 flex items-center font-bold">
                    <img src="/xp.png" height={20} width={20} alt="XP" className="mr-1" />
                    <span className="text-white/90">{formatNumber(xp)} XP</span>
                </Link>
                <Link to="/shop" className="text-orange-500 flex items-center font-bold">
                    <img src="/points.svg" height={20} width={20} alt="Points" className="mr-1" />
                    <span className="text-white/90">{formatNumber(points)}</span>
                </Link>
                <Link to="/shop" className="text-rose-500 flex items-center font-bold">
                    <img src="/heart.svg" height={18} width={18} alt="Hearts" className="mr-1" />
                    <span className="text-white/90">
                        {isPro ? <InfinityIcon className="h-4 w-4 stroke-[3] inline align-middle" /> : hearts}
                    </span>
                </Link>
            </div>
        </nav>
    )
}