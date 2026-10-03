import { UserProgress } from "@/components/user-progress";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
    userProgress: any;
};

type RekapCache = {
    rank: number | null;
    activeLesson: { unitTitle: string; lessonTitle: string } | null;
    userId: string;
    updatedAt: number;
};

const CACHE_KEY = "tajweedo_rekap_cache";

function getCachedRekap(): RekapCache | null {
    try {
        const item = sessionStorage.getItem(CACHE_KEY);
        return item ? JSON.parse(item) : null;
    } catch {
        return null;
    }
}

function setCachedRekap(data: RekapCache) {
    try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch {}
}

export const RightSidebarContent = ({ userProgress }: Props) => {
    const cached = getCachedRekap();
    const hasCache = !!cached && cached.userId === userProgress?.userId;

    const [rank, setRank] = useState<number | null>(() => (hasCache ? cached.rank : null));
    const [activeLesson, setActiveLesson] = useState<{unitTitle: string, lessonTitle: string} | null>(
        () => (hasCache ? cached.activeLesson : null)
    );
    const [loading, setLoading] = useState<boolean>(() => !hasCache);

    useEffect(() => {
        if (!userProgress?.userId) return;
        
        let isMounted = true;

        async function fetchStats(showLoading = false) {
            if (showLoading) setLoading(true);
            try {
                // Fetch in parallel for faster response
                const [lbRes, unRes] = await Promise.all([
                    fetch('/api/leaderboard'),
                    fetch('/api/units')
                ]);

                let newRank: number | null = null;
                let newActiveLesson: { unitTitle: string; lessonTitle: string } | null = null;

                if (lbRes.ok) {
                    const lbData = await lbRes.json();
                    const index = (lbData || []).findIndex((u: any) => u.userId === userProgress.userId);
                    if (index !== -1) newRank = index + 1;
                }

                if (unRes.ok) {
                    const unitsData = await unRes.json();
                    let found = false;
                    for (const u of unitsData || []) {
                        for (const l of u.lessons || []) {
                            if (!l.completed && !found) {
                                newActiveLesson = { unitTitle: u.title, lessonTitle: l.title };
                                found = true;
                                break;
                            }
                        }
                        if (found) break;
                    }
                }

                if (isMounted) {
                    setRank(newRank);
                    setActiveLesson(newActiveLesson);
                    setCachedRekap({
                        rank: newRank,
                        activeLesson: newActiveLesson,
                        userId: userProgress.userId,
                        updatedAt: Date.now()
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }
        
        // If cache exists, revalidate silently in background without showing spinner
        fetchStats(!hasCache);

        const handleRefresh = () => fetchStats(false);
        window.addEventListener('refresh-user-progress', handleRefresh);
        window.addEventListener('refresh-rekap', handleRefresh);

        return () => {
            isMounted = false;
            window.removeEventListener('refresh-user-progress', handleRefresh);
            window.removeEventListener('refresh-rekap', handleRefresh);
        };
    }, [userProgress?.userId, userProgress?.xp]);

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
