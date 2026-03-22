import { Suspense } from "react";

import { getOrgs, getRecruiters, getRecruitments, getStates } from "@/lib/serverUtils";
import { SearchListSkeleton, SidebarSkeleton } from "@/components/skeletons";
import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import RecruitmentsHeader from "./recruitmentsHeader";
import RecruitmentsList from "./recruitmentsList";

export default function RecruitmentsPage({ searchParams }) {

    return (
        <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
            <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                <div className="p-2 h-full">
                    <Suspense fallback={<SidebarSkeleton />}>
                        <Sidebar type={'desktop'} />
                    </Suspense>
                </div>
            </aside>
            <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900">
                <div className="p-5 min-h-full h-full overflow-y-auto">
                    <div className="relative flex justify-center items-center">
                        <div className="absolute left-0 xl:hidden">
                            <Suspense fallback={null}>
                                <Sidebar type={'mobile'} />
                            </Suspense>
                        </div>
                        <h1 className="text-3xl leading-none">Recruitments</h1>
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

async function Sidebar({ type }) {
    const orgs = await getOrgs();
    const states = await getStates();
    const recruiters = await getRecruiters();

    return (
        <>
            {
                type === 'desktop' ? <DesktopSidebar recruiters={recruiters} orgs={orgs} states={states} /> : <MobileSidebar recruiters={recruiters} orgs={orgs} states={states} />
            }
        </>
    )
}

async function MainContentWrapper({ searchParams }) {
    const sp = await searchParams;
    const key = JSON.stringify(sp);
    return (
        <>
            <RecruitmentsHeader />
            <Suspense key={key} fallback={<SearchListSkeleton type={'recruitment'} />}>
                <MainContent sp={sp} />
            </Suspense>
        </>
    )
}

async function MainContent({ sp }) {
    const { search, for: forSlug, by: bySlug, status, sector, qualification, expLvl, location } = sp;
    const recruitments = await getRecruitments({ search, forSlug, bySlug, status, sector, qualification, expLvl, location });
    const orgs = await getOrgs();

    await new Promise(resolve => setTimeout(resolve, 2000));

    return (
        <RecruitmentsList recruitments={recruitments} orgs={orgs} />
    )
}