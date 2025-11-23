"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Simple global route loading overlay triggered by dispatching 'route-loading-start'
// Automatically hides when pathname changes.
export function RouteLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);

  useEffect(() => {
    const onStart = () => {
      // Avoid flashing if already on target path
      setPrevPath(pathname);
      setLoading(true);
    };
    window.addEventListener("route-loading-start", onStart);
    return () => window.removeEventListener("route-loading-start", onStart);
  }, [pathname]);

  // When pathname changes, stop loader
  useEffect(() => {
    if (pathname !== prevPath) {
      setLoading(false);
      setPrevPath(pathname);
    }
  }, [pathname, prevPath]);

  // Auto-timeout (failsafe 8s)
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 8000);
    return () => clearTimeout(t);
  }, [loading]);

  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/70 backdrop-blur-sm pointer-events-none select-none">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-emerald-700 animate-pulse">Memuat...</p>
      </div>
    </div>
  );
}
