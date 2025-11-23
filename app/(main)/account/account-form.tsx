"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Avatar = { id: number; name: string; image_src: string };

export default function AccountForm() {
  const [loading, setLoading] = useState(true);
  const [saving, startTransition] = useTransition();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [currentImage, setCurrentImage] = useState<string | undefined>(undefined);
  const [owned, setOwned] = useState<Avatar[]>([]);
  // We only need a single button that opens the Install modal

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/account', { cache: 'no-store' });
        if (!res.ok) throw new Error('failed');
        const data = await res.json();
        setUsername(data?.user?.username || "");
        setCurrentImage(data?.user?.profile_image_src || undefined);
        setOwned(data?.ownedAvatars || []);
      } catch {
        toast.error("Gagal memuat data akun");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // No need to track install availability here; button opens modal which handles logic

  const onSave = () => {
    startTransition(() => {
      void (async () => {
        try {
          const payload: any = { username: username.trim() };
          if (password.trim()) payload.password = password.trim();
          if (currentImage) payload.imageSrc = currentImage;
          const res = await fetch('/api/account', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
          if (!res.ok) {
            const j = await res.json().catch(() => null);
            if (j?.error === 'username_taken') { toast.error('Username sudah dipakai'); return; }
            if (j?.error === 'not_owned') { toast.error('Gambar tidak dimiliki'); return; }
            throw new Error('save_failed');
          }
          toast.success('Tersimpan');
          window.location.reload();
        } catch {
          toast.error('Terjadi kesalahan saat menyimpan');
        }
      })();
    });
  };

  if (loading) return <div className="p-4 sm:p-6 text-sm">Memuat...</div>;

  return (
  <div className="max-w-2xl w-full bg-white border rounded-xl p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Image src="/mascot.svg" alt="Mascot" width={28} height={28} className="w-7 h-7" /> Informasi Akun
        </h2>
        <div>
          <button
            type="button"
            onClick={() => {
              const isStandalone = typeof window !== 'undefined' && (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
              if (isStandalone) { alert('Aplikasi sudah terpasang.'); return; }
              window.dispatchEvent(new Event('open-install-modal'));
            }}
            className="text-xs sm:text-sm px-3 py-1.5 rounded-md border border-emerald-300 text-emerald-700 hover:bg-emerald-50 active:scale-[0.98] transition"
          >
            Install App
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-700">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          inputMode="text"
          autoComplete="username"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Username"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-700">Password (opsional)</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder="Minimal 6 karakter"
        />
        <p className="text-xs text-slate-500">Kosongkan jika tidak ingin mengganti.</p>
      </div>

      <div className="space-y-2">
        <label className="text-sm text-slate-700">Avatar yang kamu miliki</label>
        {owned.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada avatar dimiliki.</p>
        ) : (
          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-3">
            {owned.map((a) => {
              const selected = currentImage === a.image_src;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setCurrentImage(a.image_src)}
                  className={`border rounded-lg p-2 flex items-center justify-center hover:border-emerald-500 active:scale-[0.99] transition ${selected ? 'border-emerald-500 ring-2 ring-emerald-300' : ''}`}
                >
                  <Image src={a.image_src} alt={a.name} width={64} height={64} className="w-14 h-14 sm:w-16 sm:h-16" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="danger"
          className="bg-rose-500 hover:bg-rose-600"
          onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST' });
              window.location.href = '/';
            } catch {
              // ignore
            }
          }}
        >
          Keluar
        </Button>
        <Button disabled={saving} onClick={onSave} className="flex items-center gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          <span>Simpan</span>
        </Button>
      </div>
    </div>
  );
}
