"use client"

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HeaderUser() {
    const [open, setOpen] = useState(false);
    const [user, setUser] = useState<{ id: string; username: string; profileImageSrc?: string } | null>(null);
    const ref = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/auth/me');
                if (!res.ok) return;
                const data = await res.json();
                setUser(data);
            } catch (err) {
                // ignore
            }
        }

        load();

        function onDoc(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    if (!user) return null;

    const imgSrc = user.profileImageSrc || "/profile.svg";

    return (
        <div className="relative" ref={ref}>
            <div className="flex items-center gap-3">
                {user.username ? <span className="text-sm font-medium text-slate-700">{user.username}</span> : null}

                <button
                    onClick={() => setOpen(v => !v)}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    className="h-9 w-9 rounded-full flex items-center justify-center overflow-hidden"
                >
                    <Image src={imgSrc} alt="Profile" width={36} height={36} className="rounded-full" />
                </button>
            </div>

            {open ? (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-20">
                    <Link
                        href="/account"
                        prefetch
                        onMouseEnter={() => router.prefetch?.('/account')}
                        className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setOpen(false)}
                    >
                        Akun Saya
                    </Link>
                    <button
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={async () => {
                            setOpen(false);
                            await fetch('/api/auth/logout', { method: 'POST' });
                            // reload to clear UI
                            window.location.href = '/';
                        }}
                    >
                        Keluar
                    </button>
                </div>
            ) : null}
        </div>
    );
}
