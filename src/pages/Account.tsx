import { useEffect, useState } from "react";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { RightSidebarContent } from "@/components/right-sidebar-content";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getSessionCache, setSessionCache, clearSessionCache } from "@/lib/cache";

type Avatar = { id: number; name: string; image_src: string };

export default function Account() {
  const { userProgress } = useOutletContext<{ userProgress: any }>();
  const navigate = useNavigate();

  const cachedAcc = getSessionCache<any>("tajweedo_account_cache");
  const [loading, setLoading] = useState(() => !cachedAcc);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState(() => cachedAcc?.user?.username || "");
  const [email, setEmail] = useState(() => cachedAcc?.user?.email || "");
  const [password, setPassword] = useState("");
  const [currentImage, setCurrentImage] = useState<string | undefined>(() => cachedAcc?.user?.profile_image_src || undefined);
  const [owned, setOwned] = useState<Avatar[]>(() => cachedAcc?.ownedAvatars || []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/account');
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/auth/login');
            return;
          }
          throw new Error('failed');
        }
        const data = await res.json();
        setUsername(data?.user?.username || "");
        setEmail(data?.user?.email || "");
        setCurrentImage(data?.user?.profile_image_src || undefined);
        setOwned(data?.ownedAvatars || []);
        setSessionCache("tajweedo_account_cache", data);
      } catch (e) {
        toast.error("Gagal memuat data akun");
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const onSave = async () => {
    setSaving(true);
    try {
      const payload: any = { username: username.trim(), email: email.trim() };
      if (password.trim()) payload.password = password.trim();
      if (currentImage) payload.imageSrc = currentImage;

      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        if (j?.error === 'username_taken') {
          toast.error('Username sudah dipakai');
          return;
        }
        throw new Error('save_failed');
      }
      toast.success('Tersimpan');
      window.location.reload();
    } catch {
      toast.error('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      clearSessionCache();
      window.location.href = '/';
    } catch {
      toast.error('Gagal logout');
    }
  };

  if (loading || !userProgress) return <div className="p-4 flex justify-center text-slate-500">Memuat...</div>;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <RightSidebarContent userProgress={userProgress} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col items-center pt-[28px]">
          <div className="max-w-2xl w-full bg-white border rounded-xl p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <img src="/mascot.svg" alt="Mascot" width={28} height={28} className="w-7 h-7" /> Informasi Akun
              </h2>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                maxLength={10}
                style={{ textTransform: 'lowercase' }}
                inputMode="text"
                autoComplete="username"
                className="w-full border-2 bg-slate-100 rounded-xl px-4 py-3 text-neutral-700 focus:outline-none focus:border-emerald-400 transition-colors"
                placeholder="Username"
              />
              <p className="text-xs text-slate-500 font-medium">Maksimal 10 huruf.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Email (opsional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full border-2 bg-slate-100 rounded-xl px-4 py-3 text-neutral-700 focus:outline-none focus:border-emerald-400 transition-colors"
                placeholder="email@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-bold text-slate-700">Password (opsional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full border-2 bg-slate-100 rounded-xl px-4 py-3 text-neutral-700 focus:outline-none focus:border-emerald-400 transition-colors"
                placeholder="Minimal 6 karakter"
              />
              <p className="text-xs text-slate-500 font-medium">Kosongkan jika tidak ingin mengganti.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Avatar yang kamu miliki</label>
              {owned.length === 0 ? (
                <p className="text-sm text-slate-500 font-medium">Belum ada avatar dimiliki. Beli di Toko!</p>
              ) : (
                <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 gap-3">
                  {owned.map((a) => {
                    const selected = currentImage === a.image_src;
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setCurrentImage(a.image_src)}
                        className={`border-2 rounded-xl p-2 flex items-center justify-center hover:border-emerald-500 active:scale-[0.99] transition ${selected ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}
                      >
                        <img src={a.image_src} alt={a.name} width={64} height={64} className="w-14 h-14 sm:w-16 sm:h-16 object-cover drop-shadow-sm" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t-2">
              <Button
                type="button"
                variant="danger"
                onClick={onLogout}
              >
                Keluar
              </Button>
              <Button disabled={saving} onClick={onSave} variant="secondary" className="flex items-center gap-2">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>Simpan</span>
              </Button>
            </div>
          </div>
        </div>
      </FeedWrapper>
    </div>
  );
}
