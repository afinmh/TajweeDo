import type { Metadata } from "next";
import Script from "next/script";
import { Nunito } from "next/font/google";
// Clerk removed — using local auth
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { RewardModal } from "@/components/modals/reward-modal";
import { RouteLoader } from "@/components/route-loader";

const font = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TajweeDo",
  description: "Ngaji jadi lebih seru bareng TajweeDo!",
  manifest: "/manifest.json",
  themeColor: "#10b981",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TajweeDo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/mascot.svg" type="image/svg+xml" />
        {/* iOS Home Screen icon (PNG, not SVG) */}
        <link rel="apple-touch-icon" sizes="180x180" href="/cover.png" />
        <meta name="apple-mobile-web-app-title" content="TajweeDo" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={font.className}>
        <Toaster />
        <ExitModal />
        <HeartsModal />
        <PracticeModal />
        <RewardModal />
        <RouteLoader />
        {children}
        {/* Register service worker on client */}
        <Script id="sw-register" strategy="afterInteractive">{
          `(function() {
            // PWA Installation Support
            console.log('🚀 Initializing PWA...');
            
            // Register service worker
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function () {
                navigator.serviceWorker.register('/service-worker.js')
                  .then(function(reg) {
                    console.log('✅ Service Worker registered:', reg.scope);
                    
                    // Check if SW is ready
                    if (reg.active) {
                      console.log('✅ Service Worker is active');
                    }
                    
                    // Wait a bit then check installability
                    setTimeout(() => {
                      const hasPrompt = !!window.__deferredPWAInstallPrompt;
                      if (!hasPrompt) {
                        console.log('%c💡 TIP: Run checkPWAInstallable() to see why install is not available', 'color: blue; font-style: italic');
                      }
                    }, 2000);
                  })
                  .catch(function(err) {
                    console.error('❌ Service Worker registration failed:', err);
                  });
              });
            }
            
            // Check PWA installability criteria
            function checkPWACriteria() {
              const checks = {
                https: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
                serviceWorker: 'serviceWorker' in navigator,
                manifest: document.querySelector('link[rel="manifest"]') !== null,
                standalone: window.matchMedia('(display-mode: standalone)').matches
              };
              
              console.log('📋 PWA Criteria Check:', checks);
              
              if (!checks.https) console.warn('⚠️ PWA requires HTTPS (or localhost)');
              if (!checks.serviceWorker) console.warn('⚠️ Service Worker not supported');
              if (!checks.manifest) console.warn('⚠️ Manifest link not found');
              if (checks.standalone) console.log('✅ Already running as PWA');
              
              // Additional checks
              fetch('/manifest.json')
                .then(r => r.json())
                .then(manifest => {
                  console.log('✅ Manifest loaded:', manifest.name);
                  console.log('📱 Icons:', manifest.icons.length);
                })
                .catch(e => console.error('❌ Manifest error:', e));
              
              return checks;
            }
            
            // Track beforeinstallprompt
            let installPromptEvent = null;
            
            window.addEventListener('beforeinstallprompt', function(e) {
              console.log('🎯 beforeinstallprompt event FIRED at:', new Date().toLocaleTimeString());
              e.preventDefault();
              installPromptEvent = e;
              window.__deferredPWAInstallPrompt = e;
              
              // Dispatch custom event to notify the app
              window.dispatchEvent(new CustomEvent('pwa-install-ready'));
            });
            
            window.addEventListener('appinstalled', function() {
              console.log('✅ PWA installed successfully');
              installPromptEvent = null;
              window.__deferredPWAInstallPrompt = null;
            });
            
            // Check criteria after a short delay
            setTimeout(checkPWACriteria, 1000);
            
            // Debug helper - check if prompt is available
            window.checkPWAInstallable = function() {
              const criteria = checkPWACriteria();
              const hasPrompt = !!window.__deferredPWAInstallPrompt;
              
              console.log('🔍 Install Prompt Available:', hasPrompt);
              
              if (!hasPrompt && criteria.https && criteria.serviceWorker && !criteria.standalone) {
                console.log('%c⚠️ beforeinstallprompt NOT fired yet', 'color: orange; font-weight: bold');
                console.log('');
                console.log('📌 Possible Reasons:');
                console.log('1. ❌ Chrome engagement heuristics not met');
                console.log('   → Visit site 2+ times with 5 min gap');
                console.log('   → OR interact with page (scroll, click)');
                console.log('');
                console.log('2. ❌ Manifest validation failed');
                console.log('   → Check Application tab in DevTools');
                console.log('   → Look for manifest errors');
                console.log('');
                console.log('3. ❌ Service Worker issues');
                console.log('   → Check Application → Service Workers');
                console.log('');
                console.log('💡 Quick Fix Options:');
                console.log('A. Enable bypass: chrome://flags/#bypass-app-banner-engagement-checks');
                console.log('B. Use menu: Chrome menu → Install TajweeDo');
                console.log('C. Mobile: Chrome menu → Add to Home screen');
                console.log('');
                console.log('📱 Current browser:', navigator.userAgent.includes('Chrome') ? 'Chrome ✅' : navigator.userAgent);
              } else if (hasPrompt) {
                console.log('%c✅ Install prompt is READY!', 'color: green; font-weight: bold; font-size: 14px');
                console.log('Click "Install App" button to install');
              }
              
              return { criteria, hasPrompt };
            };
            
            console.log('💡 Run checkPWAInstallable() in console to debug');
          })();`
        }</Script>
      </body>
    </html>
  );
}
