import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import { SidebarSkeleton } from "@/components/skeletons";
import { getOrgs, getStates } from "@/lib/serverUtils";
import { Suspense } from "react";

export default function JobLayout({ children }) {

    return (
        <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
            <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                <div className="p-2 h-full">
                    <Suspense fallback={<SidebarSkeleton />}>
                        <DesktopSidebar />
                    </Suspense>
                </div>
            </aside>
            <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900">
                <div className="p-5 min-h-full h-full overflow-y-auto">
                    <div className="xl:hidden">
                        <Suspense fallback={null}>
                            <MobileSidebar />
                        </Suspense>
                    </div>
                    {children}
                </div>
            </section>
            <aside className="hidden sm:flex-[25] xl:flex-[2] sm:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                <div className="flex flex-col p-2 h-full">
                    <div className="grow"></div>
                    <p className="justify-end text-center">Advertisement</p>
                </div>
            </aside>
        </div>
    )
}