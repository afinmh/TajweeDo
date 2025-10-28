"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

type Reward = { points?: number; item_id?: number } | null;

export default function DailyLogin() {
  const [open, setOpen] = useState(false);
  const [day, setDay] = useState<number | null>(null);
  const [reward, setReward] = useState<Reward>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/daily-login', { method: 'POST' });
        if (!res.ok) return;
        const j = await res.json();
        if (!mounted) return;
        setDay(j.day || null);
        setReward(j.reward || null);
        setTotal(j.totalLogins || null);
        setOpen(true);
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Allow opening the modal from anywhere via a custom event
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('open-daily-login', handler as EventListener);
    return () => window.removeEventListener('open-daily-login', handler as EventListener);
  }, []);

  const cycleDay = day ?? (((total || 0) - 1) % 30) + 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[92vw] max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
            <Image src="/calender.png" alt="Kalender" width={22} height={22} />
            Daily Login
          </DialogTitle>
        </DialogHeader>
        <div className="text-center text-slate-600 -mt-2 mb-3">
          {reward?.points ? (
            <div className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
              <Image src="/points.svg" alt="Points" width={18} height={18} /> +{reward.points}
            </div>
          ) : (
            <div className="text-slate-500 text-sm">Selamat datang kembali!</div>
          )}
        </div>
        <div className="grid grid-cols-6 gap-2 sm:gap-3 px-2 sm:px-0">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
            const done = d <= (cycleDay || 0);
            const isToday = d === (cycleDay || 0);
            return (
              <div
                key={d}
                className={`relative h-9 w-9 sm:h-10 sm:w-10 rounded-xl border flex items-center justify-center text-[12px] shadow-sm select-none ${done ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'} ${isToday ? 'ring-2 ring-emerald-300 font-semibold' : ''}`}
              >
                {d}
                {done && (
                  <div className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-white border border-emerald-300 shadow flex items-center justify-center">
                    <Image src="/ceklis.png" alt="Selesai" width={14} height={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center pt-4">
          <Button onClick={() => setOpen(false)} className="px-6">Tutup</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
