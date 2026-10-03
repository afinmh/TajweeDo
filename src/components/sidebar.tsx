import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { SidebarItem } from "./sidebar-item";
import AuthEntry from "./auth-entry";

type Props = {
    className?: string;
};

export const Sidebar = ({ className }: Props) => {
    return (
        <>
            {/* Desktop sidebar (visible on lg and up) */}
            <div className={cn(
                "hidden lg:flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r-2 flex-col bg-white",
                className,
            )}>
                <Link to="/learn" className="pt-8 pb-7 flex items-center gap-x-3 pl-4 transition-opacity hover:opacity-80">
                    <img src="/mascot.svg" height={40} width={40} alt="Mascot" className="drop-shadow-sm" />
                    <h1 className="text-[22px] font-extrabold text-green-500 tracking-tight">
                        TajweeDo
                    </h1>
                </Link>
                <div className="flex flex-col gap-y-2 flex-1 mt-2">
                    <SidebarItem label="Learn" href="/learn" iconSrc="/learn.svg" />
                    <SidebarItem label="Leaderboard" href="/leaderboard" iconSrc="/leaderboard.svg" />
                    <SidebarItem label="Shop" href="/shop" iconSrc="/shop.svg" />
                </div>
                <div className="p-4 mb-4">
                    <AuthEntry variant="button" />
                </div>
            </div>

            {/* Mobile bottom navbar (visible below lg) */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 z-40 px-6 py-3">
                <div className="max-w-screen-sm mx-auto flex items-center justify-between">
                    <Link to="/learn" aria-label="Belajar" className="flex items-center text-slate-700 hover:opacity-75 transition">
                        <img src="/learn.svg" alt="Learn" width={32} height={32} />
                    </Link>
                    <Link to="/leaderboard" aria-label="Papan" className="flex items-center text-slate-700 hover:opacity-75 transition">
                        <img src="/leaderboard.svg" alt="Leaderboard" width={32} height={32} />
                    </Link>
                    <Link to="/shop" aria-label="Toko" className="flex items-center text-slate-700 hover:opacity-75 transition">
                        <img src="/shop.svg" alt="Shop" width={32} height={32} />
                    </Link>
                    <div className="flex items-center text-slate-700 hover:opacity-75 transition">
                        <AuthEntry variant="compact" />
                    </div>
                </div>
            </nav>
        </>
    );
};