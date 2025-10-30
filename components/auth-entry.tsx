"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import HeaderUser from "@/components/header-user";

type Variant = "full" | "button" | "compact";
type OpenMode = "route" | "modal";

export default function AuthEntry({ variant = "full", openMode = "route" }: { variant?: Variant; openMode?: OpenMode }) {
  const [user, setUser] = useState<null | { id: string; username: string; profileImageSrc?: string }>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) { setLoaded(true); return; }
        const data = await res.json();
        if (mounted) setUser(data);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (!loaded) return null;

  if (user) {
    if (variant === "full") {
      return <HeaderUser />;
    }
    if (variant === "compact") {
      const imgSrc = user.profileImageSrc || "/profile.svg";
      return (
        <Link href="/account" aria-label="Akun Saya" className="flex items-center justify-center">
          <Image key={imgSrc} src={imgSrc} alt="Profile" width={32} height={32} className="rounded-full" />
        </Link>
      );
    }
    // button variant -> small avatar + name button to account
    return (
      <Link href="/account">
        <Button size="sm" variant="secondaryOutline">
          <span className="mr-2">{user.username}</span>
          <Image src={user.profileImageSrc || "/profile.svg"} alt="Profile" width={18} height={18} className="rounded-full" />
        </Button>
      </Link>
    );
  }

  // Not logged in
  const openLogin = () => {
    if (openMode === "modal") {
      try { window.dispatchEvent(new Event("open-login")); } catch {}
      return;
    }
    // fallback route navigation
    window.location.href = "/auth/login";
  };

  if (variant === "button") {
    return (
      <Button size="sm" onClick={openLogin}>Masuk / Daftar</Button>
    );
  }
  if (variant === "compact") {
    return (
      <Button size="sm" onClick={openLogin}>Masuk</Button>
    );
  }
  return (
    <Button className="lg" variant="ghost" onClick={openLogin}>Login</Button>
  );
}
