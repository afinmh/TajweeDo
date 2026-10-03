import { useEffect, useState } from "react";
import { FeedWrapper } from "@/components/feed-wrapper";
import { StickyWrapper } from "@/components/sticky-wrapper";
import { RightSidebarContent } from "@/components/right-sidebar-content";
import { useOutletContext } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSessionCache, setSessionCache } from "@/lib/cache";

export default function Shop() {
  const { userProgress } = useOutletContext<{ userProgress: any }>();
  const cachedShop = getSessionCache<any[]>("tajweedo_shop_cache");
  const [shopItems, setShopItems] = useState<any[]>(() => 
    (cachedShop || []).filter((i: any) => i.itemType === 'shop' || i.itemType === 'profile')
  );
  const [giftItems, setGiftItems] = useState<any[]>(() => 
    (cachedShop || []).filter((i: any) => i.itemType === 'gift')
  );
  const [achievementItems, setAchievementItems] = useState<any[]>(() => 
    (cachedShop || []).filter((i: any) => i.itemType === 'achievement')
  );
  const [loading, setLoading] = useState(() => !cachedShop);
  const [pending, setPending] = useState(false);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/shop/items');
      if (res.ok) {
        const data = await res.json();
        const all = data || [];
        setShopItems(all.filter((i: any) => i.itemType === 'shop' || i.itemType === 'profile'));
        setGiftItems(all.filter((i: any) => i.itemType === 'gift'));
        setAchievementItems(all.filter((i: any) => i.itemType === 'achievement'));
        setSessionCache("tajweedo_shop_cache", all);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const getRequirement = (name: string): string => {
    const n = (name || '').toLowerCase();
    if (n.includes('bahlil')) return 'Selesaikan 5 misi harian';
    if (n.includes('sultan')) return 'Beli semua item yang ada di toko';
    if (n.includes('bunga')) return 'Login 7 hari';
    if (n.includes('bintang')) return 'Login 15 hari';
    if (n.includes('kelinci')) return 'Login 22 hari';
    if (n.includes('kucing')) return 'Login 30 hari';
    if (n.includes('burger')) return 'Selesaikan 1 materi pembelajaran';
    if (n.includes('batman')) return 'Selesaikan 2 materi pembelajaran';
    if (n.includes('iron') || n.includes('iron man')) return 'Selesaikan 4 materi pembelajaran';
    if (n.includes('king')) return 'Bereskan semua materi pembelajaran';
    return 'Terkunci';
  };

  const playMoney = async () => {
    try {
      const a = new Audio('/audio/money.mp3');
      await a.play().catch(() => {});
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        a.addEventListener('ended', done, { once: true });
        setTimeout(done, 5000);
      });
    } catch {}
  };

  const onPurchase = async (itemId: number, price: number) => {
    if (pending) return;
    if ((userProgress?.points || 0) < price) {
      toast.error('Poin tidak cukup');
      return;
    }

    setPending(true);
    try {
      const res = await fetch('/api/shop/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id: itemId }),
      });
      await res.json().catch(() => ({}));
      
      if (!res.ok) {
        if (res.status === 402) toast.error('Poin tidak cukup');
        else if (res.status === 409) toast.info('Sudah dimiliki');
        else toast.error('Gagal membeli');
        return;
      }

      toast.success('Berhasil dibeli');
      await playMoney();
      // optimistic update
      setShopItems(prev => prev.map(it => it.id === itemId ? { ...it, purchased: true } : it));
      window.location.reload();
    } catch (e) {
      toast.error('Gagal membeli');
    } finally {
      setPending(false);
    }
  };

  if (!userProgress) return null;

  return (
    <div className="flex flex-row-reverse gap-[48px] px-6">
      <StickyWrapper>
        <RightSidebarContent userProgress={userProgress} />
      </StickyWrapper>

      <FeedWrapper>
        <div className="w-full flex flex-col items-center pt-[28px]">
          <img src="/shop.svg" alt="Shop" height={90} width={90} />
          <h1 className="text-center font-bold text-neutral-800 text-2xl my-6">Toko</h1>
          <p className="text-muted-foreground text-center text-lg mb-6">Habiskan poin Anda untuk item-item keren.</p>
          
          <ul className="w-full">
            <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
                <img
                    src="/heart.svg"
                    alt="Heart"
                    height={60}
                    width={60}
                    className="h-[60px] w-[60px]"
                />
                <div className="flex-1">
                    <p className="text-neutral-700 text-base lg:text-xl font-bold">
                        Isi Ulang Nyawa
                    </p>
                </div>
                <Button
                    disabled
                >
                    Penuh
                </Button>
            </div>
            
            <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
                <img
                    src="/calender.png"
                    alt="Daily Login"
                    height={60}
                    width={60}
                    className="h-[60px] w-[60px]"
                />
                <div className="flex-1">
                    <p className="text-neutral-700 text-base lg:text-xl font-bold">
                        Login Harian
                    </p>
                    <p className="text-xs text-slate-500">Klaim hadiah harianmu</p>
                </div>
                <Button
                    onClick={() => {
                        if (typeof window !== "undefined") {
                            window.dispatchEvent(new Event("open-daily-login"));
                        }
                    }}
                >
                    Buka
                </Button>
            </div>

            {/* Shop items list */}
            <div className="border-t-2 mt-2">
                <div className="p-4 pb-2">
                    <p className="text-neutral-700 text-base lg:text-xl font-bold">Item Toko</p>
                    <p className="text-xs text-slate-500">Koleksi avatar lucu untuk profilmu</p>
                </div>
                {loading ? (
                    <div className="p-4 text-sm text-slate-500">Memuat item...</div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pt-2">
                        {shopItems.map((it) => (
                            <div key={it.id} className="border rounded-xl p-3 flex flex-col items-center gap-2">
                                <img src={it.imageSrc} alt={it.name} className="w-16 h-16 object-cover" />
                                <div className="text-sm font-semibold text-slate-700 text-center line-clamp-1">{it.name}</div>
                                <Button
                                    disabled={pending || it.purchased || (userProgress.points || 0) < it.pricePoints}
                                    onClick={() => onPurchase(it.id, it.pricePoints)}
                                    variant="secondary"
                                    className="w-full"
                                >
                                    {it.purchased ? 'Dimiliki' : (
                                        <div className="flex items-center gap-1">
                                            <img src="/points.svg" alt="Points" className="h-[18px] w-[18px]" />
                                            <span>{it.pricePoints}</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
                
                {!loading && (giftItems.length > 0 || achievementItems.length > 0) && (
                    <>
                        {giftItems.length > 0 && (
                            <>
                                <div className="p-4 pt-0">
                                    <p className="text-neutral-700 text-base lg:text-xl font-bold">Hadiah</p>
                                    <p className="text-xs text-slate-500">Diperoleh dari hadiah/bonus khusus</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pt-2">
                                    {giftItems.map((it) => (
                                        <div key={it.id} className="relative border rounded-xl p-3 flex flex-col items-center gap-1 opacity-80">
                                            <div className="absolute right-2 top-2 bg-white/90 border rounded-full h-6 w-6 flex items-center justify-center text-slate-600">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                    <path d="M7 10V8a5 5 0 1110 0v2" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                                                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="#64748b" strokeWidth="2"/>
                                                </svg>
                                            </div>
                                            <img src={it.imageSrc} alt={it.name} className="w-16 h-16 object-cover" />
                                            <div className="text-sm font-semibold text-slate-700 text-center line-clamp-1">{it.name}</div>
                                            <div className="text-[10px] text-slate-500 text-center">{getRequirement(it.name)}</div>
                                            <Button disabled variant="secondaryOutline" className="w-full mt-2">Terkunci</Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                        {achievementItems.length > 0 && (
                            <>
                                <div className="p-4 pt-0">
                                    <p className="text-neutral-700 text-base lg:text-xl font-bold">Pencapaian</p>
                                    <p className="text-xs text-slate-500">Buka dengan menyelesaikan target tertentu</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pt-2">
                                    {achievementItems.map((it) => (
                                        <div key={it.id} className="relative border rounded-xl p-3 flex flex-col items-center gap-1 opacity-80">
                                            <div className="absolute right-2 top-2 bg-white/90 border rounded-full h-6 w-6 flex items-center justify-center text-slate-600">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                    <path d="M7 10V8a5 5 0 1110 0v2" stroke="#64748b" strokeWidth="2" strokeLinecap="round"/>
                                                    <rect x="5" y="10" width="14" height="10" rx="2" stroke="#64748b" strokeWidth="2"/>
                                                </svg>
                                            </div>
                                            <img src={it.imageSrc} alt={it.name} className="w-16 h-16 object-cover" />
                                            <div className="text-sm font-semibold text-slate-700 text-center line-clamp-1">{it.name}</div>
                                            <div className="text-[10px] text-slate-500 text-center">{getRequirement(it.name)}</div>
                                            <Button disabled variant="secondaryOutline" className="w-full mt-2">Terkunci</Button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
          </ul>
        </div>
      </FeedWrapper>
    </div>
  );
}
