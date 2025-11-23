"use client";
import React from "react";
import { X } from "lucide-react";

// We intentionally keep this lightweight without shadcn dialog infra to avoid global portal complexity.
// Appears bottom-left on (main) pages if PWA not installed.
export const InstallAppModal: React.FC = () => {
  const [visible, setVisible] = React.useState(false);
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);
  const [showManualInstructions, setShowManualInstructions] = React.useState(false);
  const [isWaiting, setIsWaiting] = React.useState(false);
  const waitTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    // If already installed, do nothing
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (isStandalone) return;

    // Capture the install prompt GLOBALLY when it fires (usually on page load)
    const onBeforeInstallPrompt = (e: any) => {
      console.log("✅ beforeinstallprompt event captured");
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).__deferredPWAInstallPrompt = e;
      setIsWaiting(false);
      setShowManualInstructions(false);
      if (waitTimeoutRef.current) {
        clearTimeout(waitTimeoutRef.current);
        waitTimeoutRef.current = null;
      }
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);

    // Listen for custom event when prompt is ready
    const onPWAReady = () => {
      console.log("✅ PWA install ready event received");
      const dp = (window as any).__deferredPWAInstallPrompt;
      if (dp) {
        setDeferredPrompt(dp);
        setIsWaiting(false);
        setShowManualInstructions(false);
        if (waitTimeoutRef.current) {
          clearTimeout(waitTimeoutRef.current);
          waitTimeoutRef.current = null;
        }
      }
    };
    window.addEventListener("pwa-install-ready", onPWAReady);

    const onAppInstalled = () => {
      console.log("✅ App installed");
      setVisible(false);
      setDeferredPrompt(null);
      (window as any).__deferredPWAInstallPrompt = null;
      try { localStorage.setItem("install-modal-dismissed", "true"); } catch {}
    };
    window.addEventListener("appinstalled", onAppInstalled);

    // When user clicks "Install App" button, open modal immediately
    const manualOpen = () => {
      console.log("🔵 Install button clicked");
      try { localStorage.removeItem("install-modal-dismissed"); } catch {}
      const isStandaloneNow = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;
      if (isStandaloneNow) return;
      
      // Always open the modal immediately with user gesture
      setVisible(true);
      
      // Check if we already have the prompt saved from earlier
      const dp = (window as any).__deferredPWAInstallPrompt;
      if (dp) {
        console.log("✅ Using cached prompt - install ready!");
        setDeferredPrompt(dp);
        setShowManualInstructions(false);
        setIsWaiting(false);
      } else {
        // Wait for the prompt with a timeout
        console.log("⏳ Waiting for beforeinstallprompt event...");
        setIsWaiting(true);
        setShowManualInstructions(false);
        
        // Give it 2 seconds to receive the event (reduced from 3)
        waitTimeoutRef.current = setTimeout(() => {
          console.log("⚠️ Timeout - showing manual instructions");
          console.log("💡 Run checkPWAInstallable() in console to see why");
          setIsWaiting(false);
          setShowManualInstructions(true);
          waitTimeoutRef.current = null;
        }, 2000);
      }
    };
    window.addEventListener('open-install-modal', manualOpen as any);

    // Check on mount if prompt was already captured
    const existingPrompt = (window as any).__deferredPWAInstallPrompt;
    if (existingPrompt) {
      console.log("✅ Found existing prompt on mount");
      setDeferredPrompt(existingPrompt);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt as any);
      window.removeEventListener("pwa-install-ready", onPWAReady);
      window.removeEventListener("appinstalled", onAppInstalled);
      window.removeEventListener('open-install-modal', manualOpen as any);
      if (waitTimeoutRef.current) {
        clearTimeout(waitTimeoutRef.current);
      }
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      setShowManualInstructions(true);
      return;
    }
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setVisible(false);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("Install error:", err);
      setShowManualInstructions(true);
    }
  };

  const handleClose = () => {
    setVisible(false);
    setShowManualInstructions(false);
    setIsWaiting(false);
    if (waitTimeoutRef.current) {
      clearTimeout(waitTimeoutRef.current);
      waitTimeoutRef.current = null;
    }
    try { localStorage.setItem("install-modal-dismissed", "true"); } catch {}
  };

  const getBrowserInstructions = () => {
    if (typeof navigator === "undefined") return "Gunakan menu browser untuk menginstall aplikasi.";
    
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes("chrome") && !ua.includes("edg")) {
      return "Chrome: Ketuk ⋮ (menu) → Install app / Add to Home screen";
    } else if (ua.includes("safari") && !ua.includes("chrome")) {
      return "Safari: Ketuk tombol Share → Add to Home Screen";
    } else if (ua.includes("firefox")) {
      return "Firefox: Ketuk ⋮ (menu) → Install";
    } else if (ua.includes("edg")) {
      return "Edge: Ketuk ⋯ (menu) → Apps → Install this site as an app";
    }
    return "Gunakan menu browser: Add to Home Screen / Install App";
  };

  if (!visible) return null;

  return (
    <div className="fixed left-4 bottom-4 z-40 w-[320px] rounded-xl bg-white shadow-xl border border-emerald-200 p-4 animate-in fade-in slide-in-from-bottom">
      <button aria-label="Tutup" onClick={handleClose} className="absolute top-2 right-2 text-emerald-600 hover:text-emerald-800">
        <X className="w-4 h-4" />
      </button>
      <h3 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
        <img src="/mascot.svg" alt="Mascot" className="w-6 h-6" />
        Install TajweeDo
      </h3>
      <p className="text-sm text-gray-600 mb-3 leading-snug">
        Pasang aplikasi agar akses lebih cepat & pengalaman fullscreen. Gratis dan ringan.
      </p>

      {isWaiting ? (
        <div className="flex flex-col items-center justify-center gap-2 py-6 mb-3">
          <span className="inline-block w-5 h-5 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-emerald-700 font-medium">Menyiapkan instalasi...</span>
          <span className="text-xs text-gray-500">Tunggu sebentar</span>
        </div>
      ) : showManualInstructions ? (
        <div className="space-y-3 mb-3">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-amber-800 mb-1">Browser tidak mendukung install otomatis</p>
            <p className="text-xs text-amber-700 mb-2">Ini normal untuk beberapa browser. Gunakan cara manual:</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-xs font-semibold text-emerald-800 mb-1.5">Cara Install:</p>
            <p className="text-xs text-emerald-700 leading-relaxed">
              {getBrowserInstructions()}
            </p>
          </div>
        </div>
      ) : deferredPrompt ? (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-xs text-green-700 flex items-center gap-1">
            <span className="font-medium">Siap diinstall! Klik tombol di bawah.</span>
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        {deferredPrompt && !isWaiting && (
          <button
            onClick={handleInstall}
            className="w-full text-sm font-semibold py-2.5 rounded-md transition bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
          >
            Install Sekarang
          </button>
        )}
        {showManualInstructions && (
          <button
            onClick={handleClose}
            className="w-full text-sm font-semibold py-2.5 rounded-md transition bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95"
          >
            Mengerti
          </button>
        )}
        <button onClick={handleClose} className="w-full text-xs text-emerald-700 hover:underline py-1">
          {showManualInstructions ? 'Tutup' : 'Nanti saja'}
        </button>
      </div>
    </div>
  );
};
