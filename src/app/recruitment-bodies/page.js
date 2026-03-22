import { Suspense } from "react";

import RecruitmentBodies from "./recruitmentBodiesList";
import { SearchListSkeleton } from "@/components/skeletons";
import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import { getRecruitmentBodies } from "@/lib/serverUtils";
import RecruitmentBodiesHeader from "./recruitmentBodiesHeader";
import RecruitmentBodiesList from "./recruitmentBodiesList";

export default function RecruitmentBodiesPage({ searchParams }) {

    return (
        <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
            <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                <div className="p-2 h-full">
                    <Suspense fallback={null}>
                        <DesktopSidebar />
                    </Suspense>
                </div>
            </aside>
            <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900">
                <div className="p-5 min-h-full h-full overflow-y-auto">
                    <div className="relative flex justify-center items-center">
                        <div className="absolute left-0 lg:hidden">
                            <Suspense fallback={null}>
                                <MobileSidebar />
                            </Suspense>
                        </div>
                        <h1 className="text-3xl text-brand leading-none">Recruitment Bodies</h1>
                    </div>
                    <Suspense fallback={null}>
                        <MainContentWrapper searchParams={searchParams} />
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

async function MainContentWrapper({ searchParams }) {
    const sp = await searchParams;
    const key = JSON.stringify(sp);
    return (
        <>
            <RecruitmentBodiesHeader />
            <Suspense key={key} fallback={<SearchListSkeleton type={'org'} />}>
                <MainContent searchParams={searchParams} />
            </Suspense>
        </>
    )
}

async function MainContent({ searchParams }) {
    const { search, sector } = await searchParams;
    const recruitmentBodies = await getRecruitmentBodies(search, sector);

    await new Promise(resolve => setTimeout(resolve, 2000));

    return <RecruitmentBodiesList recruitmentBodies={recruitmentBodies} />
}