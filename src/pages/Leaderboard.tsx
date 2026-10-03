import { useEffect, useState } from "react";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { RightSidebarContent } from "@/components/right-sidebar-content";
import { useOutletContext } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Leaderboard() {
  const { userProgress } = useOutletContext<{ userProgress: any }>();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setLeaderboard(data || []);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchLeaderboard();
  }, []);

  // Reset pagination when searching
  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery]);

  if (!userProgress) return null;

  const usersWithRank = leaderboard.map((u, i) => ({ ...u, rank: i + 1 }));
  const filteredLeaderboard = usersWithRank.filter(user => 
    user.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const paginatedLeaderboard = filteredLeaderboard.slice(0, visibleCount);
  const hasMore = visibleCount < filteredLeaderboard.length;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <RightSidebarContent userProgress={userProgress} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col items-center pt-[28px]">
          <img src="/leaderboard.svg" alt="Leaderboard" height={90} width={90} />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">Leaderboard</h1>
          <p className="text-muted-foreground text-center text-lg mb-6">Lihat posisi Anda di antara pembelajar lain di komunitas.</p>
          
          <div className="w-full relative mb-6">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari pengguna..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border-2 border-slate-200 text-neutral-800 placeholder:text-slate-400 rounded-xl px-10 py-3 focus:outline-none focus:border-emerald-400 transition-colors"
            />
          </div>

          <Separator className="mb-4 h-0.5 rounded-full" />
          
          {paginatedLeaderboard.length === 0 ? (
            <p className="text-slate-500 mt-10">Pengguna tidak ditemukan.</p>
          ) : (
            <div className="w-full">
              {paginatedLeaderboard.map((user) => {
                const rank = user.rank;
                let rankColor = "text-lime-700";
                if (rank === 1) rankColor = "text-yellow-500";
                else if (rank === 2) rankColor = "text-slate-400";
                else if (rank === 3) rankColor = "text-amber-600";

                return (
                  <div key={user.userId} className="flex items-center w-full p-3 px-4 rounded-xl hover:bg-gray-200/50 transition-colors">
                    <p className={`font-bold text-lg w-8 text-center mr-2 ${rankColor}`}>{rank}</p>
                    <Avatar className="h-14 w-14 ml-3 mr-6 drop-shadow-sm">
                      <AvatarImage src={user.userImageSrc || "/standar.png"} className="object-cover" />
                      <AvatarFallback>{user.userName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-bold text-neutral-800 flex-1 text-lg">{user.userName}</p>
                    <p className="text-muted-foreground font-medium">{user.xp || user.points} XP</p>
                  </div>
                );
              })}
              
              {hasMore && (
                <Button 
                  onClick={() => setVisibleCount(prev => prev + 10)}
                  variant="secondary"
                  className="w-full mt-6"
                >
                  Tampilkan Lainnya
                </Button>
              )}
            </div>
          )}
        </div>
      </FeedWrapper>
    </div>
  );
}
