"use client";

import { toast } from "sonner";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";

import { refillHearts } from "@/actions/user-progress";
import { Button } from "@/components/ui/button";
import { POINTS_TO_REFILL } from "@/constants";

type Props = {
    hearts: number;
    points: number;
    hasActiveSubscription: boolean;
};

export const Items = ({
    hearts,
    points,
    hasActiveSubscription,
}: Props) => {
    const [pending, startTransition] = useTransition();
    const [shopItems, setShopItems] = useState<Array<{id:number; name:string; imageSrc:string; pricePoints:number; purchased:boolean;}>>([]);
    const [giftItems, setGiftItems] = useState<Array<{id:number; name:string; imageSrc:string; itemType:string;}>>([]);
    const [achievementItems, setAchievementItems] = useState<Array<{id:number; name:string; imageSrc:string; itemType:string;}>>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/store/items', { cache: 'no-store' });
                const data = await res.json();
                const all = (data || []);
                const onlyShop = all.filter((i: any) => i.itemType === 'shop');
                const gifts = all.filter((i: any) => i.itemType === 'gift');
                const achievements = all.filter((i: any) => i.itemType === 'achievement');
                setShopItems(onlyShop);
                setGiftItems(gifts);
                setAchievementItems(achievements);
            } catch {
                // ignore
            } finally {
                setLoading(false);
            }
        })();
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

    const onRefillHearts = () => {
        if (pending || hearts === 5 || points < POINTS_TO_REFILL) {
            return;
        };

        startTransition(() => {
            refillHearts()
                .catch(() => toast.error("Terjadi kesalahan"));
            toast.success("Nyawa berhasil ditambahkan");
        })
    };

    const playMoney = async () => {
        try {
            const a = new Audio('/audio/money.mp3');
            // Play and wait until it ends or timeout after 5s
            await a.play().catch(() => {});
            await new Promise<void>((resolve) => {
                const done = () => resolve();
                a.addEventListener('ended', done, { once: true });
                // Safety timeout in case 'ended' doesn't fire
                setTimeout(done, 5000);
            });
        } catch {}
    };

    const onPurchase = (itemId: number, price: number) => {
        if (pending) return;
        if (points < price) {
            toast.error('Poin tidak cukup');
            return;
        }
        startTransition(async () => {
            try {
                const res = await fetch('/api/store/purchase', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemId, equip: false }),
                });
                const j = await res.json().catch(() => ({}));
                if (!res.ok || j.status === 'insufficient-points') {
                    toast.error('Poin tidak cukup');
                    return;
                }
                if (j.status === 'already-owned') {
                    toast.info('Sudah dimiliki');
                } else {
                    toast.success('Berhasil dibeli');
                    // Play cash sound on successful purchase and wait before refreshing
                    await playMoney();
                }
                // optimistic: mark purchased; refresh page for points
                setShopItems((prev) => prev.map(it => it.id === itemId ? { ...it, purchased: true } : it));
                window.location.reload();
            } catch {
                toast.error('Gagal membeli');
            }
        });
    };

        return (
                <ul className="w-full">
            <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
                <Image
                    src="/heart.svg"
                    alt="Heart"
                    height={60}
                    width={60}
                />
                <div className="flex-1">
                    <p className="text-neutral-700 text-base lg:text-xl font-bold">
                        Isi Ulang Nyawa
                    </p>
                </div>
                <Button
                    onClick={onRefillHearts}
                    disabled={
                        pending
                        || hearts === 5
                        || points < POINTS_TO_REFILL
                    }
                >
                    {hearts === 5
                        ? "Penuh"
                        : (
                            <div className="flex items-center">
                                <Image
                                    src="/points.svg"
                                    alt="Points"
                                    height={20}
                                    width={20}
                                />
                                <p>
                                    {POINTS_TO_REFILL}
                                </p>
                            </div>
                        )
                    }
                </Button>
            </div>
            <div className="flex items-center w-full p-4 gap-x-4 border-t-2">
                <Image
                    src="/calender.png"
                    alt="Daily Login"
                    height={60}
                    width={60}
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
                                <div className="p-4 text-sm text-slate-500">Memuat item…</div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 pt-2">
                                    {shopItems.map((it) => (
                                        <div key={it.id} className="border rounded-xl p-3 flex flex-col items-center gap-2">
                                            <Image src={it.imageSrc} alt={it.name} width={64} height={64} className="w-16 h-16" />
                                            <div className="text-sm font-semibold text-slate-700 text-center line-clamp-1">{it.name}</div>
                                            <Button
                                                disabled={pending || it.purchased || points < it.pricePoints}
                                                onClick={() => onPurchase(it.id, it.pricePoints)}
                                            >
                                                {it.purchased ? 'Dimiliki' : (
                                                    <div className="flex items-center gap-1">
                                                        <Image src="/points.svg" alt="Points" height={18} width={18} />
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
                                                                                        <Image src={it.imageSrc} alt={it.name} width={64} height={64} className="w-16 h-16" />
                                                                                        <div className="text-sm font-semibold text-slate-700 text-center line-clamp-1">{it.name}</div>
                                                                                        <div className="text-[10px] text-slate-500 text-center">{getRequirement(it.name)}</div>
                                                                                        <Button disabled variant="secondaryOutline">Terkunci</Button>
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
                                                                                        <Image src={it.imageSrc} alt={it.name} width={64} height={64} className="w-16 h-16" />
                                                                                        <div className="text-sm font-semibold text-slate-700 text-center line-clamp-1">{it.name}</div>
                                                                                        <div className="text-[10px] text-slate-500 text-center">{getRequirement(it.name)}</div>
                                                                                        <Button disabled variant="secondaryOutline">Terkunci</Button>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </>
                                                        )}
                        </div>
        </ul>
    );
};