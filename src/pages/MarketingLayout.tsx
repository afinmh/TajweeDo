import { Link, Outlet } from "react-router-dom";
import AuthEntry from "@/components/auth-entry";

const Header = () => {
    return (
        <header className="h-20 w-full border-b-2 border-slate-200 px-4">
            <div className="lg:max-w-screen-lg mx-auto flex items-center justify-between h-full">
                <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
                    <img src="/mascot.svg" height={40} width={40} alt="Mascot" />
                    <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
                        TajweeDo
                    </h1>
                </div>
                <AuthEntry variant="full" openMode="modal" />
            </div>
        </header>
    )
}

const Footer = () => {
    return (
        <footer className="hidden lg:block w-full border-t-2 border-slate-200 py-4">
            <div className="max-w-screen-lg mx-auto flex items-center justify-between h-full px-4">
                <div className="flex items-center gap-4">
                    <div aria-hidden className="p-2">
                        <img src="/mascot.svg" alt="Maskot" width={32} height={32} className="w-8 h-8" />
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
                            <Link to="/privacy" className="hover:underline">Kebijakan Privasi</Link>
                            <span className="mx-2">•</span>
                            <Link to="/terms" className="hover:underline">Syarat & Ketentuan</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default function MarketingLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
