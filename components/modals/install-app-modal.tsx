"use client";
import React from "react";
import { X } from "lucide-react";

// We intentionally keep this lightweight without shadcn dialog infra to avoid global portal complexity.
// Appears bottom-left on (main) pages if PWA not installed.
export const InstallAppModal: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;
    // If already in standalone display, don't show
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isStandalone) return;
    // If user previously dismissed, skip
    try {
      if (localStorage.getItem("install-modal-dismissed") === "true") return;
    } catch {}

    const onBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (navigator.onLine) {
        setVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
    const onAppInstalled = () => {
      setVisible(false);
      try { localStorage.setItem("install-modal-dismissed", "true"); } catch {}
    };
    window.addEventListener("appinstalled", onAppInstalled);
    // Fallback: if event never fires (Safari iOS), we can still offer instructions if not standalone
    const timer = setTimeout(() => {
      if (!deferredPrompt && navigator.onLine) {
        // Show generic instructions modal unless iOS where UX differs. We'll show anyway.
        setVisible(true);
      }
    }, 4000);

    const onlineHandler = () => {
      if (deferredPrompt && !visible) setVisible(true);
    };
    const offlineHandler = () => setVisible(false);
    window.addEventListener("online", onlineHandler);
    window.addEventListener("offline", offlineHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener("online", onlineHandler);
      window.removeEventListener("offline", offlineHandler);
      clearTimeout(timer);
    };
  }, [deferredPrompt, visible]);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Show manual instructions on how to install
      alert("Gunakan menu browser: Add to Home Screen / Install App.");
      return;
    }
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleClose = () => {
    setVisible(false);
    try { localStorage.setItem("install-modal-dismissed", "true"); } catch {}
  };

  if (!visible) return null;

  return (
    <div className="fixed left-4 bottom-4 z-40 w-[280px] rounded-xl bg-white shadow-lg border border-emerald-200 p-4 animate-in fade-in slide-in-from-bottom">
      <button aria-label="Tutup" onClick={handleClose} className="absolute top-2 right-2 text-emerald-600 hover:text-emerald-800">
        <X className="w-4 h-4" />
      </button>
      <h3 className="font-bold text-emerald-700 mb-1">Install TajweeDo</h3>
      <p className="text-sm text-gray-600 mb-3 leading-snug">
        Pasang aplikasi agar akses lebih cepat & pengalaman fullscreen. Gratis dan ringan.
      </p>
      <div className="space-y-2">
        <button onClick={handleInstall} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2 rounded-md transition">
          Install Sekarang
        </button>
        <button onClick={handleClose} className="w-full text-xs text-emerald-700 hover:underline">
          Nanti saja
        </button>
      </div>
    </div>
  );
};
