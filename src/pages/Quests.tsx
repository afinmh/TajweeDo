import { FeedWrapper } from "@/components/feed-wrapper";
import { useOutletContext } from "react-router-dom";
import { QuestsMenu } from "@/components/quests/menu";

export default function QuestsPage() {
  const { userProgress } = useOutletContext<{ userProgress: any }>();

  if (!userProgress || !userProgress.activeCourseId) {
    return null; // The layout handles redirect
  }

  return (
    <div className="flex flex-col lg:flex-row justify-center gap-[48px] px-6">
      <FeedWrapper>
        {/* Stats header for desktop since StickyWrapper is removed */}
        <div className="hidden lg:flex items-center justify-end gap-x-4 border-b-2 pb-3 mb-5 lg:pt-[28px] lg:mt-[-28px] text-sm font-bold">
          <div className="flex items-center gap-x-1.5 text-blue-500">
            <img src="/xp.png" alt="XP" className="h-5 w-5" />
            {userProgress.xp || 0} XP
          </div>
          <div className="flex items-center gap-x-1.5 text-orange-500">
            <img src="/points.svg" alt="Points" className="h-5 w-5" />
            {userProgress.points || 0}
          </div>
          <div className="flex items-center gap-x-1.5 text-rose-500">
            <img src="/heart.svg" alt="Hearts" className="h-5 w-5" />
            {userProgress.hearts || 0}
          </div>
        </div>

        <div className="w-full flex flex-col items-center">
          <img src="/puzzle.png" alt="Quests" height={90} width={90} />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">Doa Harian</h1>
          <p className="text-muted-foreground text-center text-lg mb-6">
            Ayo Hafalkan Semua Doanya!
          </p>
          <div className="w-full mt-4">
             <QuestsMenu />
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
}
