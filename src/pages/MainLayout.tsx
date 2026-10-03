import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { InstallAppModal } from "@/components/modals/install-app-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import DailyLogin from "@/components/daily-login";

export default function MainLayout() {
  const [userProgress, setUserProgress] = useState<{ points: number; hearts: number; xp: number } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await fetch('/api/user/progress');
        if (res.status === 401) {
          navigate('/');
          return;
        }
        if (res.ok) {
          const data = await res.json();
          setUserProgress(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadProgress();
    window.addEventListener('refresh-user-progress', loadProgress);
    return () => window.removeEventListener('refresh-user-progress', loadProgress);
  }, [navigate]);

  return (
    <>
      <MobileHeader 
        points={userProgress?.points || 0} 
        xp={userProgress?.xp || 0} 
        hearts={userProgress?.hearts || 0} 
      />
      <Sidebar className="hidden lg:flex" />
      <main className="lg:pl-[256px] min-h-screen pt-[50px] lg:pt-0">
        <div className="max-w-[1056px] mx-auto pt-6 h-full pb-[80px]">
          <Outlet context={{ userProgress, setUserProgress }} />
        </div>
      </main>
      <InstallAppModal />
      <DailyLogin />
      <HeartsModal />
    </>
  );
}
