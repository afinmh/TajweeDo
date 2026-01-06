import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { userProgressService } from "@/lib/services";
import Image from "next/image";
import { redirect } from "next/navigation";
import NeedCourse from "@/components/need-course";
import { Items } from "./items";
import { Quests } from "@/components/quests";

// Disable caching for this page to always get fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ShopPage = async () => {
    // ✅ Use service for cleaner data access
    const userProgress = await userProgressService.getCurrentUserProgress();

    if(!userProgress || !userProgress.activeCourse){
        return <NeedCourse />;
    }

    return (
        <div className="flex flex-row-reverse gap-[48px] px-6">
            <StickyWrapper>
                <UserProgress
                    activeCourse={userProgress.activeCourse}
                    hearts={userProgress.hearts}
                    points={userProgress.points}
                    hasActiveSubscription={false}
                />

                <Quests points={userProgress.points}/>

            </StickyWrapper>
            <FeedWrapper>
                <div className="w-full flex flex-col items-center">
                    <Image
                        src="/shop.svg"
                        alt="Shop"
                        height={90}
                        width={90}
                    />
                    <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">
                        Shop
                    </h1>
                    <p className="text-muted-foreground text-center text-lg mb-6">
                        Ayo tukar poinmu jadi barang keren!
                    </p>
                    <Items 
                        hearts={userProgress.hearts}
                        points={userProgress.points}
                        hasActiveSubscription={false}
                    />
                </div>
            </FeedWrapper>
        </div>
    );
}

export default ShopPage;