import { UserProgress } from "@/components/user-progress";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
    userProgress: any;
};

export const RightSidebarContent = ({ userProgress }: Props) => {
    const [rank, setRank] = useState<number | null>(null);
    const [activeLesson, setActiveLesson] = useState<{unitTitle: string, lessonTitle: string} | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userProgress) return;
        
        async function fetchStats() {
            try {
                // Fetch leaderboard for rank
                const lbRes = await fetch('/api/leaderboard');
                if (lbRes.ok) {
                    const lbData = await lbRes.json();
                    const index = (lbData || []).findIndex((u: any) => u.userId === userProgress.userId);
                    if (index !== -1) setRank(index + 1);
                }

                // Fetch units for current lesson
                const unRes = await fetch('/api/units');
                if (unRes.ok) {
                    const unitsData = await unRes.json();
                    let found = false;
                    for (const u of unitsData || []) {
                        for (const l of u.lessons || []) {
                            if (!l.completed && !found) {
                                setActiveLesson({ unitTitle: u.title, lessonTitle: l.title });
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        
        fetchStats();
    }, [userProgress]);

    if (!userProgress) return null;

    return (
        <div className="flex flex-col gap-y-4">
            <UserProgress
                userImageSrc={userProgress.userImageSrc || userProgress.profile_image_src}
                hearts={userProgress.hearts}
                points={userProgress.points}
                xp={userProgress.xp}
                hasActiveSubscription={false}
            />

            {/* Quick Actions (Cepat & Mudah) */}
            <div className="flex flex-col gap-y-2 mt-2">
                <h3 className="font-bold text-[17px] text-slate-700">Cepat & Mudah</h3>
                
                <div className="flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 flex gap-3 border-2 border-slate-200 hover:bg-slate-100 rounded-xl"
                        onClick={() => {
                            if (typeof window !== "undefined") {
                                window.dispatchEvent(new Event("open-daily-login"));
                            }
                        }}
                    >
                        <img src="/calender.png" alt="Daily Login" width={24} height={24} />
                        <div className="flex flex-col items-start gap-y-0.5">
                            <span className="font-bold text-[15px] text-slate-700">Login Harian</span>
                            <span className="text-[13px] font-medium text-slate-500">Klaim hadiah gratis!</span>
                        </div>
                    </Button>

                    <Link to="/shop" className="w-full">
                        <Button
                            variant="ghost"
                            className="w-full justify-start h-auto p-3 flex gap-3 border-2 border-slate-200 hover:bg-slate-100 rounded-xl"
                        >
                            <img src="/heart.svg" alt="Buy Hearts" width={24} height={24} />
                            <div className="flex flex-col items-start gap-y-0.5">
                                <span className="font-bold text-[15px] text-slate-700">Beli Nyawa</span>
                                <span className="text-[13px] font-medium text-slate-500">Isi nyawa di Toko</span>
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Rekap Belajar */}
            <div className="border-2 border-slate-200 rounded-xl p-4 flex flex-col gap-y-3 mt-2">
                <div className="flex items-center">
                    <h3 className="font-bold text-[17px] text-slate-700">Rekap Belajar</h3>
                </div>
                
                {loading ? (
                    <div className="flex items-center justify-center py-2">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {/* Current Position */}
                        <div className="flex items-center w-full py-2 gap-x-3">
                            <img src="/learn.svg" alt="Book" width={28} height={28} className="drop-shadow-sm shrink-0" />
                            <div className="flex flex-col flex-1 truncate gap-y-0.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saat Ini</span>
                                <span className="font-bold text-slate-700 truncate text-[15px]">
                                    {activeLesson ? activeLesson.unitTitle : "Semua Selesai!"}
                                </span>
                                {activeLesson && (
                                    <span className="text-[13px] font-medium text-blue-500 truncate">
                                        {activeLesson.lessonTitle}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="w-full h-[2px] bg-slate-200 my-1" />

                        {/* Leaderboard Rank */}
                        <div className="flex items-center w-full py-2 gap-x-3">
                            <img src="/leaderboard.svg" alt="Rank" width={28} height={28} className="drop-shadow-sm shrink-0" />
                            <div className="flex flex-col flex-1 truncate gap-y-0.5">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Peringkat</span>
                                <span className="font-bold text-slate-700 truncate text-[15px]">
                                    {rank ? `Posisi #${rank}` : "Belum ada peringkat"}
                                </span>
                                <span className="text-[13px] font-medium text-orange-500">
                                    {userProgress.xp || 0} XP
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
