import { Link } from "react-router-dom";
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
        <Link to="/account" aria-label="Akun Saya" className="flex items-center justify-center">
          <img src={imgSrc} alt="Profile" width={32} height={32} className="rounded-full" />
        </Link>
      );
    }
    return (
      <Link to="/account" className="w-full block">
        <Button variant="ghost" className="w-full justify-start h-auto py-2 px-3 flex items-center gap-x-3 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">
          <img src={user.profileImageSrc || "/standar.png"} alt="Profile" width={32} height={32} className="rounded-full border shadow-sm object-cover" />
          <span className="font-bold truncate text-sm uppercase tracking-wider">{user.username}</span>
        </Button>
      </Link>
    );
  }

  const openLogin = () => {
    if (openMode === "modal") {
      try { window.dispatchEvent(new Event("open-login")); } catch {}
      return;
    }
    window.location.href = "/auth/login";
  };

  if (variant === "button") {
    return <Button size="sm" onClick={openLogin}>Masuk / Daftar</Button>;
  }
  if (variant === "compact") {
    return <Button size="sm" onClick={openLogin}>Masuk</Button>;
  }
  return <Button className="lg" variant="ghost" onClick={openLogin}>Login</Button>;
}
