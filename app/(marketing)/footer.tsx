import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
    return (
        <footer className="hidden lg:block w-full border-t-2 border-slate-200 py-4">
            <div className="max-w-screen-lg mx-auto flex items-center justify-between h-full px-4">
                <div className="flex items-center gap-4">
                    <div aria-hidden className="p-2">
                        <Image src="/mascot.svg" alt="Maskot" width={32} height={32} className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Belajar Tajwid Seru</h3>
                        <p className="text-sm text-slate-500">Belajar tajwid dengan cara yang menarik dan interaktif</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">

                    <div className="text-right text-xs text-slate-500">
                        <div>© 2025 TajweeDo</div>
                        <div className="mt-1">
                            <Link href="/privacy" className="hover:underline">Kebijakan Privasi</Link>
                            <span className="mx-2">•</span>
                            <Link href="/terms" className="hover:underline">Syarat & Ketentuan</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};