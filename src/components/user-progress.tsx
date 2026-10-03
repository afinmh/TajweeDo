import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { InfinityIcon } from "lucide-react";
// types moved off Drizzle; using structural typing

type Props = {
    userImageSrc?: string;
    hearts: number;
    points: number;
    xp?: number;
    hasActiveSubscription: boolean;
};

export const UserProgress = ({ userImageSrc, points, hearts, xp = 0, hasActiveSubscription }: Props) => {
    return (
        <div className="flex items-center justify-between gap-x-2 w-full border-2 rounded-2xl p-4 bg-white drop-shadow-sm">
            <Link to="/account">
                <Button variant="ghost" className="hover:bg-transparent px-2">
                    <img
                        src={userImageSrc || "/standar.png"}
                        alt="Profile"
                        className="object-cover drop-shadow-sm"
                        width={44}
                        height={44}
                    />
                </Button>
            </Link>
            
            <div className="flex items-center gap-x-2">
                <div className="flex items-center gap-x-1.5 font-bold text-blue-500 bg-blue-50/50 hover:bg-blue-50 px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                    <img src='/xp.png' height={22} width={22} alt="XP" />
                    <span className="text-[15px]">{xp} XP</span>
                </div>
                
                <Link to="/shop">
                    <Button variant="ghost" className="text-orange-500 font-bold bg-orange-50/50 hover:bg-orange-100 rounded-lg px-2 py-1.5 h-auto transition-colors whitespace-nowrap">
                        <img src='/points.svg' height={22} width={22} alt="Points" className="mr-1.5"/>
                        <span className="text-[15px]">{points}</span>
                    </Button>
                </Link>
                <Link to="/shop">
                    <Button variant="ghost" className="text-rose-500 font-bold bg-rose-50/50 hover:bg-rose-100 rounded-lg px-2 py-1.5 h-auto transition-colors whitespace-nowrap">
                        <img src='/heart.svg' height={22} width={22} alt="Hearts" className="mr-1.5"/>
                        {hasActiveSubscription ? <InfinityIcon className="h-4 w-4 stroke-[3]"/> : <span className="text-[15px]">{hearts}</span>}
                    </Button>
                </Link>
            </div>
        </div>
    );
};