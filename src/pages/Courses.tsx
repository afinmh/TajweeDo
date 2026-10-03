import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          setCourses(data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const { userProgress, setUserProgress } = useOutletContext<{ userProgress: any, setUserProgress: any }>();

  const selectCourse = async (courseId: number) => {
    try {
      const res = await fetch('/api/user/course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      if (res.ok) {
        setUserProgress((prev: any) => ({ ...prev, activeCourseId: courseId }));
        window.dispatchEvent(new CustomEvent('refresh-user-progress'));
        navigate('/learn');
      } else {
        console.error('Failed to select course');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-10 text-center">Memuat kursus...</div>;

  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <h1 className="text-2xl font-bold text-neutral-700 mb-6">Pilih Kursus</h1>
      <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4 sm:gap-6">
        {courses.map((course) => {
          const active = userProgress?.activeCourseId === course.id;
          return (
            <div 
              key={course.id}
              onClick={() => selectCourse(course.id)}
              className={`w-full border-2 rounded-xl border-b-4 hover:bg-black/5 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-3 pb-6 min-h-[190px] sm:min-h-[217px] ${active ? "bg-green-50 border-green-200" : ""}`}
            >
              <div className="w-full flex items-center justify-end min-h-[24px]"></div>
  
              <div className="mt-2 flex items-center justify-center w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] rounded-lg drop-shadow-md border object-cover bg-white">
                <img
                    src={course.imageSrc}
                    alt={course.title}
                    className="object-cover w-full h-full rounded-lg"
                />
              </div>
  
              <p className={`text-center font-bold mt-3 text-sm sm:text-base ${active ? "text-green-700" : "text-neutral-700"}`}>
                  {course.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
