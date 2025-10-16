"use client"

import { useUser, useClerk } from "@clerk/nextjs";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

export default function HeaderUser() {
    const { isSignedIn, user } = useUser();
    const clerk = useClerk();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("click", onDoc);
        return () => document.removeEventListener("click", onDoc);
    }, []);

    const name = user?.firstName || user?.fullName || user?.username || "";

    if (!isSignedIn) return null;

    const imgSrc = user?.profileImageUrl || user?.imageUrl || "/profile.svg";

    return (
        <div className="relative" ref={ref}>
            <div className="flex items-center gap-3">
                {name ? <span className="text-sm font-medium text-slate-700">{name}</span> : null}

                <button
                    onClick={() => setOpen(v => !v)}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    className="h-9 w-9 rounded-full bg-emerald-600 flex items-center justify-center overflow-hidden"
                >
                    <Image src={imgSrc} alt="Profile" width={36} height={36} />
                </button>
            </div>

            {open ? (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-md z-20">
                    <a
                        href="/account"
                        className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={() => setOpen(false)}
                    >
                        Akun Saya
                    </a>
                    <button
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                        onClick={async () => {
                            setOpen(false);
                            await clerk.signOut();
                        }}
                    >
                        Keluar
                    </button>
                </div>
            ) : null}
        </div>
    );
}
