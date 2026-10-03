import { useEffect, useState, useRef } from "react";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { RightSidebarContent } from "@/components/right-sidebar-content";
import { Unit } from "@/components/learn/unit";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionCache, setSessionCache } from "@/lib/cache";

function Header({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 bg-white pb-3 lg:pt-[28px] lg:mt-[-28px] flex items-center justify-between border-b-2 mb-5 text-neutral-400 lg:z-50 px-2">
      <Button variant="ghost" size="sm" onClick={() => navigate('/courses')} className="shrink-0">
        <ArrowLeft className="h-5 w-5 stroke-2 text-neutral-400" />
      </Button>
      <h1 className="font-bold text-lg text-center flex-1">{title}</h1>
      <div className="w-10" /> {/* Spacer for centering */}
    </div>
  );
}

export default function Learn() {
  const navigate = useNavigate();
  const { userProgress } = useOutletContext<{ userProgress: any }>();
  
  const cacheKey = `tajweedo_units_${userProgress?.activeCourseId || 0}`;
  const cachedUnits = getSessionCache<any[]>(cacheKey);

  const [units, setUnits] = useState<any[]>(() => cachedUnits || []);
  const [loading, setLoading] = useState(() => !cachedUnits);
  const activeLessonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      if (!userProgress) return;
      if (!userProgress.activeCourseId) {
        navigate('/courses');
        return;
      }
      try {
        const res = await fetch('/api/units');
        if (res.ok) {
          const data = await res.json();
          setUnits(data || []);
          setSessionCache(`tajweedo_units_${userProgress.activeCourseId}`, data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    window.addEventListener('refresh-user-progress', loadData);
    return () => window.removeEventListener('refresh-user-progress', loadData);
  }, [userProgress?.activeCourseId, navigate]);

  // Auto-scroll to active lesson after data loads
  useEffect(() => {
    if (!loading && activeLessonRef.current) {
      activeLessonRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading]);

  if (loading || !userProgress) return <div className="p-10 text-center">Memuat...</div>;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <RightSidebarContent userProgress={userProgress} />
      </StickyWrapper>
      <FeedWrapper>
        <Header title={userProgress.userName || "Learn"} />
        {units.length === 0 && <div className="text-center text-slate-500 mt-10">Belum ada unit yang tersedia.</div>}
        {units.map((unit) => {
          let activeLesson = null;
          for (const u of units) {
            for (const l of u.lessons) {
              if (!l.completed && !activeLesson) {
                activeLesson = l;
              }
            }
          }
          const learnImages = ['/learn/1.png', '/learn/2.png', '/learn/3.png', '/learn/4.png', '/learn/5.png', '/learn/6.png'];
          
          return (
            <div key={unit.id} className="mb-10">
              <Unit
                id={unit.id}
                order={unit.order}
                description={unit.description}
                title={unit.title}
                lessons={unit.lessons || []}
                activeLesson={activeLesson}
                activeLessonPercentage={0}
                learnImages={learnImages}
                activeLessonRef={activeLessonRef}
              />
            </div>
          );
        })}
      </FeedWrapper>
    </div>
  );
}
