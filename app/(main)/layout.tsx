import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { InstallAppModal } from "@/components/modals/install-app-modal";
import { getUserProgress } from "@/db/queries";
import { ClientLayout } from "@/components/client-layout";

type Props = {
    children: React.ReactNode;
};

const MainLayout = async ({
    children
}: Props) => {
    const userProgress = await getUserProgress();
    const points = userProgress?.points ?? 0;
    const hearts = userProgress?.hearts ?? 0;

    return (
        <ClientLayout>
            <MobileHeader points={points} hearts={hearts} />
            <Sidebar className="hidden lg:flex"/>
            <main className="lg:pl-[256px] h-full pt-[50px] lg:pt-0">
                <div className="max-w-[1056px] mx-auto pt-6 h-full">
                    {children}
                </div>
            </main>
            <InstallAppModal />
        </ClientLayout>
    );
}

export default MainLayout;