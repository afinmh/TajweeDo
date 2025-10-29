import Link from "next/link";
import Image from "next/image";

export default function NeedCourse() {
  return (
    <div className="min-h-[320px] w-full flex items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="max-w-lg w-full bg-white border border-neutral-200 rounded-xl shadow-sm p-6 text-center">
        <Image
          src="/buku.png"
          alt="Buku"
          width={88}
          height={88}
          className="mx-auto mb-4"
        />
        <h2 className="text-lg font-semibold text-neutral-900 mb-2">Ayo pilih materi dulu</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Pilih kursus supaya kamu bisa mengakses Shop, Leaderboard, dan Quests.
        </p>
        <div className="flex justify-center">
          <Link
            href="/courses"
            className="inline-flex items-center rounded-md bg-primary text-white px-4 py-2 text-sm font-medium hover:opacity-95"
          >
            Pilih Materi
          </Link>
        </div>
      </div>
    </div>
  );
}
