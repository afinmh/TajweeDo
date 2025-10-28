"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function QuestsMenu() {
  const router = useRouter();

  const openDailyLogin = () => {
    // Fire a custom event that DailyLogin component listens to
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("open-daily-login"));
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <button
        type="button"
        onClick={openDailyLogin}
        className="w-full border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-emerald-400 active:scale-[0.99] transition"
      >
        <Image src="/calender.png" alt="Daily Login" width={48} height={48} />
        <div className="text-base font-semibold text-slate-700">Daily Login</div>
        <div className="text-xs text-slate-500">Klaim hadiah harianmu</div>
      </button>

      <button
        type="button"
        onClick={() => router.push("/daily")}
        className="w-full border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-emerald-400 active:scale-[0.99] transition"
      >
        <Image src="/quests.svg" alt="Daily Quest" width={48} height={48} />
        <div className="text-base font-semibold text-slate-700">Daily Quest</div>
        <div className="text-xs text-slate-500">Tantangan harian</div>
      </button>
    </div>
  );
}
