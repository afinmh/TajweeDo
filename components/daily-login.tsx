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
  const [rewardsMap, setRewardsMap] = useState<Record<number, { points?: number; item_id?: number }>>({});
  const [claimedToday, setClaimedToday] = useState<boolean>(false);
  const [hideToday, setHideToday] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Helper: refresh rewards and state, and auto-open if server says so
  const refreshState = async (autoOpen = true) => {
    try {
      const rres = await fetch('/api/daily-login', { method: 'GET', cache: 'no-store' });
      if (!rres.ok) return;
      const data = await rres.json();
      if (Array.isArray(data.rewards)) {
        const map: Record<number, any> = {};
        data.rewards.forEach((it: any) => { map[it.day] = { points: it.points, item_id: it.item_id }; });
        setRewardsMap(map);
      }
      if (data.state) {
        setDay(data.state.day || null);
        setReward(data.state.reward || null);
        setTotal(data.state.totalLogins || null);
        setClaimedToday(!!data.state.status);
        setHideToday(!!data.state.view);
        if (autoOpen && data.state.show) setOpen(true);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await refreshState(true);
    })();
    return () => { mounted = false; };
  }, []);

  // Allow opening the modal from anywhere via a custom event
  useEffect(() => {
    const handler = async () => {
      await refreshState(false);
      setOpen(true);
    };
    window.addEventListener('open-daily-login', handler as EventListener);
    return () => window.removeEventListener('open-daily-login', handler as EventListener);
  }, []);

  const todayIndex = day ?? (((total || 0) % 30) + 1);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[88vw] max-w-md rounded-2xl p-6 sm:p-8 bg-white border border-slate-100 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl flex items-center justify-center gap-2">
            <Image src="/calender.png" alt="Kalender" width={22} height={22} />
            Daily Login
          </DialogTitle>
        </DialogHeader>
        <div className="text-center text-slate-600 -mt-1 mb-2">
          {reward?.points ? (
            claimedToday ? (
              <div className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                <Image src="/points.svg" alt="Points" width={18} height={18} /> +{reward.points}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-emerald-600">
                Siap klaim <Image src="/points.svg" alt="Points" width={16} height={16} /> +{reward.points}
              </div>
            )
          ) : (
            <div className="text-slate-500 text-sm">Selamat datang kembali!</div>
          )}
        </div>
  <div className="grid grid-cols-6 gap-[3px] sm:gap-2 px-1 sm:px-0">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => {
            const isToday = d === (todayIndex || 0);
            const done = d < (todayIndex || 0) || (claimedToday && isToday);
            const meta = rewardsMap[d];
            const titleText = meta
              ? meta.item_id
                ? `Hadiah +${meta.points ?? 0} XP`
                : `+${meta.points ?? 0} XP`
              : done
              ? "Selesai"
              : "Belum klaim";

            return (
              <div
                key={d}
                role="button"
                tabIndex={0}
                title={titleText}
                className={`relative h-8 w-8 sm:h-9 sm:w-9 rounded-xl border flex items-center justify-center text-[12px] shadow-sm select-none ${done ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'} ${isToday ? 'ring-2 ring-emerald-300 font-semibold' : ''}`}
              >
                {d}
                {/* reward item avatar (top-left) */}
                {meta?.item_id && (
                  // map item_id -> image path using known profile images
                  <div className="absolute -left-1 -top-1 h-5 w-5 rounded-full bg-white border shadow flex items-center justify-center overflow-hidden">
                    <Image
                      src={
                        meta.item_id === 1 ? '/profile/beruang.png'
                        : meta.item_id === 2 ? '/profile/bintang.png'
                        : meta.item_id === 3 ? '/profile/bunga.png'
                        : meta.item_id === 4 ? '/profile/kelinci.png'
                        : '/shop/kucing.png'
                      }
                      alt={'Hadiah'}
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  </div>
                )}

                {/* claimed checkmark (top-right) */}
                {done && (
                  <div className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-white border border-emerald-300 shadow flex items-center justify-center">
                    <Image src="/ceklis.png" alt="Selesai" width={14} height={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Controls: hide today bottom-left on mobile + single action button */}
        <div className="mt-2 pt-2 relative min-h-[48px]">
          <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 absolute left-1 bottom-1 sm:static sm:left-auto sm:bottom-auto">
            <input
              type="checkbox"
              className="h-4 w-4 accent-emerald-600"
              checked={hideToday}
              onChange={async (e) => {
                const v = e.target.checked;
                setHideToday(v);
                try {
                  await fetch('/api/daily-login', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ view: v }),
                  });
                  if (v) setOpen(false);
                } catch {}
              }}
            />
            Sembunyikan hari ini
          </label>
          <div className="w-full flex justify-end">
            <Button
              disabled={loading}
              onClick={async () => {
                if (claimedToday) {
                  setOpen(false);
                  return;
                }
                try {
                  setLoading(true);
                  const res = await fetch('/api/daily-login', { method: 'POST' });
                  if (res.ok) {
                    const j = await res.json();
                    if (j?.status === 'claimed' || j?.status === 'already_claimed') {
                      setDay(j.day || null);
                      setReward(j.reward || null);
                      setTotal(j.totalLogins || j.total_logins || null);
                      setClaimedToday(true);
                    }
                  }
                } finally {
                  setLoading(false);
                }
              }}
              className="px-4"
            >
              {claimedToday ? 'Tutup' : (loading ? 'Memproses…' : 'Claim')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
