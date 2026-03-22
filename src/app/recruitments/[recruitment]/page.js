import { Suspense } from "react";
import { notFound } from "next/navigation";

import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import { getRecruitmentDetails, getRecruitmentSidebarDetails } from "@/lib/serverUtils";
import Recruitment from "./recruitment";
import { ContentSkeleton, SearchListSkeleton, SidebarSkeleton } from "@/components/skeletons";

export default function RecruitmentPage({ params, searchParams }) {
    return (
        <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
            <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                <div className="p-2 h-full">
                    <Suspense fallback={<SidebarSkeleton />}>
                        <SidebarWrapper screen='desktop' params={params} />
                    </Suspense>
                </div>
            </aside>
            <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900">
                <div className="p-5 min-h-full h-full overflow-y-auto">
                    <div className="xl:hidden">
                        <Suspense fallback={null}>
                            <SidebarWrapper screen='mobile' params={params} />
                        </Suspense>
                    </div>
                    <Suspense fallback={<p>Loading...</p>}>
                        <MainContentWrapper params={params} searchParams={searchParams} />
                    </Suspense>
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

async function SidebarWrapper({ screen, params }) {
    const { recruitment } = await params;
    const sidebarDetails = await getRecruitmentSidebarDetails(recruitment);
    if (sidebarDetails)
        return (
            <Suspense fallback={<p>Loading...</p>}>
                {screen === 'desktop' ? <DesktopSidebar details={sidebarDetails} /> : <MobileSidebar details={sidebarDetails} />}
            </Suspense>
        )
    else
        notFound();
}

async function MainContentWrapper({ params, searchParams }) {
    const { recruitment } = await params;
    const sp = await searchParams;
    const { y, state } = sp;
    const key = JSON.stringify(sp);
    const isValid = await getRecruitmentDetails(recruitment, y, state);
    if (isValid)
        return (
            <>
                <Suspense key={key} fallback={<ContentSkeleton />}>
                    <MainContent params={params} searchParams={searchParams} />
                </Suspense>
            </>
        )
    else
        notFound();
}

async function MainContent({ params, searchParams }) {
    const { recruitment } = await params;
    const { y, stage } = await searchParams;
    const recruitmentDetails = await getRecruitmentDetails(recruitment, y, stage);

    await new Promise(resolve => setTimeout(resolve, 2000));

    return <Recruitment recruitmentDetails={recruitmentDetails} />
}