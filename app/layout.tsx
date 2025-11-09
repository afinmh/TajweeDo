import type { Metadata } from "next";
import Script from "next/script";
import { Nunito } from "next/font/google";
// Clerk removed — using local auth
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";

const font = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TajweeDo",
  description: "Ngaji jadi lebih seru bareng TajweeDo!"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={font.className}>
        <Toaster />
        <ExitModal />
        <HeartsModal />
        <PracticeModal />
        {children}
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* Register service worker on client */}
        <Script id="sw-register" strategy="afterInteractive">{
          `if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
              navigator.serviceWorker.register('/service-worker.js');
            });
          }`
        }</Script>
      </body>
    </html>
  );
}
