"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

// Simple global route loading overlay triggered by dispatching 'route-loading-start'
// Automatically hides when pathname changes.
export function RouteLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  useEffect(() => {
    const onStart = () => {
      // Avoid flashing if already on target path
      setPrevPath(pathname);
      setLoading(true);
      setShowSlowWarning(false);
    };
    window.addEventListener("route-loading-start", onStart);
    return () => window.removeEventListener("route-loading-start", onStart);
  }, [pathname]);

  // When pathname changes, stop loader
  useEffect(() => {
    if (pathname !== prevPath) {
      setLoading(false);
      setShowSlowWarning(false);
      setPrevPath(pathname);
    }
  }, [pathname, prevPath]);

  // Show warning after 3s, force close after 15s
  useEffect(() => {
    if (!loading) return;
    const warningTimer = setTimeout(() => setShowSlowWarning(true), 3000);
    const forceCloseTimer = setTimeout(() => {
      setLoading(false);
      setShowSlowWarning(false);
    }, 15000);
    return () => {
      clearTimeout(warningTimer);
      clearTimeout(forceCloseTimer);
    };
  }, [loading]);

  if (!loading) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-sm pointer-events-none select-none">
      <div className="flex flex-col items-center gap-4 max-w-xs px-6">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <Image 
            src="/buku.png" 
            alt="Loading" 
            width={32} 
            height={32} 
            className="absolute inset-0 m-auto"
          />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-emerald-700 animate-pulse">
            {showSlowWarning ? "Hampir siap..." : "Memuat pelajaran..."}
          </p>
          {showSlowWarning && (
            <p className="text-xs text-slate-500 mt-2 animate-fade-in">
              Mohon tunggu sebentar, sistem sedang mempersiapkan soal
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
