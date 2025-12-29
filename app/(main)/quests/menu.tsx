"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function QuestsMenu() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <button
        type="button"
        onClick={() => router.push("/daily")}
        className="w-full border rounded-xl p-4 flex items-center gap-4 hover:border-emerald-400 active:scale-[0.99] transition"
      >
        <div className="flex-shrink-0">
          <Image src="/puzzle.png" alt="Daily Quest" width={48} height={48} className="rounded-md" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-base font-semibold text-slate-700">Doa Harian</div>
          <div className="text-xs text-slate-500">Hafalkan semua doanya!</div>
        </div>
      </button>
    </div>
  );
}
