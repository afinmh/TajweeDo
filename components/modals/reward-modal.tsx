"use client";
import { useEffect, useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RewardItem {
  id: number;
  name: string;
  imageSrc: string;
  purchased: boolean;
}

export function RewardModal() {
  const [open, setOpen] = useState(false);
  const [itemId, setItemId] = useState<number | null>(null);
  const [loginDay, setLoginDay] = useState<number | null>(null);
  const [totalLogins, setTotalLogins] = useState<number | null>(null);
  const [item, setItem] = useState<RewardItem | null>(null);
  const [claiming, startTransition] = useTransition();
  const [celebrated, setCelebrated] = useState(false); // kept if future enhancement needed

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ itemId: number; day?: number; total?: number }>;
      const id = ce.detail?.itemId;
      if (!id) return;
      setItemId(id);
      setLoginDay(ce.detail.day ?? null);
      setTotalLogins(ce.detail.total ?? null);
      setOpen(true);
    };
    window.addEventListener('open-reward-modal', handler as EventListener);
    return () => window.removeEventListener('open-reward-modal', handler as EventListener);
  }, []);

  useEffect(() => {
    if (!open || !itemId) return;
    (async () => {
      try {
        const res = await fetch('/api/store/items', { cache: 'no-store' });
        if (!res.ok) return;
        const items: any[] = await res.json();
        const found = items.find(i => i.id === itemId);
        if (found) {
          setItem({ id: found.id, name: found.name, imageSrc: found.imageSrc, purchased: !!found.purchased });
          // Trigger celebration audio once per open
          try {
            const audio = new Audio('/audio/finish.mp3');
            void audio.play();
          } catch {}
          setCelebrated(true);
        }
      } catch {}
    })();
  }, [open, itemId]);

  const onClaim = () => {
    if (!item || item.purchased) { setOpen(false); return; }
    startTransition(() => {
      void (async () => {
        try {
          const res = await fetch('/api/store/purchase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id, equip: true }),
          });
          const j = await res.json().catch(() => null);
          if (res.ok && j?.status === 'purchased') {
            toast.success('Hadiah diklaim!');
            setItem({ ...item, purchased: true });
          } else if (j?.status === 'already-owned') {
            toast.info('Item sudah dimiliki');
            setItem({ ...item, purchased: true });
          } else if (j?.status === 'insufficient-points') {
            toast.error('Poin tidak cukup');
          } else {
            toast.error('Gagal klaim hadiah');
          }
        } catch {
          toast.error('Terjadi kesalahan');
        }
      })();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-[min(92vw,480px)] max-w-[480px] p-4 sm:p-6 rounded-lg max-h-[90vh] overflow-auto bg-white shadow-xl border border-slate-100">
        <DialogHeader>
          <div className="flex items-center w-full justify-center mb-3">
            {item ? (
              <Image
                src={item.imageSrc}
                alt={item.name}
                height={120}
                width={120}
                className="w-24 h-24 sm:w-32 sm:h-32 select-none"
              />
            ) : (
              <div className="h-24 w-24 sm:h-32 sm:w-32 flex items-center justify-center">
                <div className="h-16 w-16 border-4 border-emerald-200 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <DialogTitle className="text-center font-bold text-lg sm:text-2xl">
            {item ? 'Hadiah Spesial' : 'Memuat Hadiah'}
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm text-muted-foreground">
            {item ? (
              item.purchased
                ? 'Item sudah ditambahkan & dipakai sebagai avatar!'
                : 'Selamat! Kamu mendapatkan hadiah login khusus.'
            ) : 'Mengambil data item...'}
          </DialogDescription>
          {item && loginDay && (
            <p className="text-center mt-2 text-[11px] sm:text-xs font-medium text-emerald-600">Login {loginDay} Hari · Total {totalLogins ?? loginDay} hari</p>
          )}
        </DialogHeader>
        {item && !item.purchased && (
          <p className="text-center text-[11px] sm:text-xs text-slate-500 mt-2">Klaim untuk langsung dipakai sebagai avatar.</p>
        )}
        <DialogFooter className="mt-6 mb-2">
          <div className="flex flex-col gap-y-4 w-full">
            <Button
              variant={item?.purchased ? 'secondary' : 'primary'}
              className="w-full text-sm sm:text-base py-2 sm:py-3"
              disabled={claiming || !item}
              onClick={() => { if (!item) return; onClaim(); if (item.purchased) setOpen(false); }}
            >
              {claiming ? 'Memproses…' : item ? (item.purchased ? 'Tutup' : 'Claim Hadiah') : 'Memuat...'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
