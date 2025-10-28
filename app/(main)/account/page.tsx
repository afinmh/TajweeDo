import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { UserProgress } from "@/components/user-progress";
import { getUserProgress } from "@/db/queries";
import { redirect } from "next/navigation";
import AccountForm from "./account-form";

export const metadata = {
  title: 'Akun Saya',
};

export default async function AccountPage() {
  const userProgress = await getUserProgress();
  if (!userProgress || !userProgress.activeCourse) {
    redirect('/courses');
  }
  const isPro = false;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-4 sm:px-6">
      <StickyWrapper>
        <UserProgress
          activeCourse={userProgress.activeCourse}
          hearts={userProgress.hearts}
          points={userProgress.points}
          hasActiveSubscription={isPro}
        />
      </StickyWrapper>
      <FeedWrapper>
        <div className="w-full flex flex-col items-center pb-4 sm:pb-0">
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">Pengaturan Akun</h1>
          <AccountForm />
        </div>
      </FeedWrapper>
    </div>
  );
}
