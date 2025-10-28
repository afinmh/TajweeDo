"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function Home() {
  const router = useRouter();
  const [showRegister, setShowRegister] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Gagal mendaftar");
      }
      // JWT cookie set by API; redirect to learn
      router.push("/learn");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Login gagal");
      }
      router.push("/learn");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-[988px] mx-auto flex-1 w-full flex flex-col lg:flex-row items-center justify-center p-4 gap-2">
      <div className="relative w-[240px] h-[240px] lg:w-[424px] lg:h-[424px] mb-8 lg:mb-0">
        <Image src="/hero.svg" fill alt="Hero Image" />
      </div>
      <div className="flex flex-col items-center gap-y-8">
        <h1 className="text-xl lg:text-3xl font-bold text-neutral-600 max-w-[380px] text-center">
          Tajwid Itu Gampang, Yuk Belajar Bareng TajweeDo!
        </h1>
        <div className="flex flex-col items-center gap-y-3 max-w-[330px] w-full">
          <div className="w-full">
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={async () => {
                setError(null);
                setLoading(true);
                try {
                  const res = await fetch("/api/auth/me", { cache: "no-store" });
                  if (res.ok) {
                    router.push("/courses");
                    return;
                  }
                  setShowRegister(true);
                } catch {
                  setShowRegister(true);
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? "Memproses..." : "Ayo Mulai!"}
            </Button>
            <Button
              size="lg"
              variant="primaryOutline"
              className="w-full mt-2"
              onClick={() => {
                setError(null);
                setShowLogin(true);
              }}
            >
              Sudah Punya Akun?
            </Button>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="sm:max-w-sm w-[92%] rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Daftar</DialogTitle>
            <DialogDescription>Buat akun baru dengan username dan password.</DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reg-username" className="text-sm font-medium">Username</label>
              <input
                id="reg-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                minLength={3}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="nama pengguna"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="reg-password" className="text-sm font-medium">Password</label>
              <input
                id="reg-password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                pattern={"^.{6,}$"}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <p className="text-xs text-slate-500">Minimal 6 karakter.</p>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Daftar"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-sm w-[92%] rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Masuk</DialogTitle>
            <DialogDescription>Masuk dengan username dan password.</DialogDescription>
          </DialogHeader>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-username" className="text-sm font-medium">Username</label>
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="nama pengguna"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                pattern={"^.{6,}$"}
                className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
