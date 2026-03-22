import { Suspense } from "react";

import { SearchListSkeleton, SidebarSkeleton } from "@/components/skeletons";
import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import { getJobs, getOrgs, getStates } from "@/lib/serverUtils";
import JobsHeader from "./jobsHeader";
import JobsList from "./jobsList";

export default function JobsPage({ searchParams }) {

    return (
        <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
            <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                <div className="p-2 h-full">
                    <Suspense fallback={<SidebarSkeleton />}>
                        <SidebarWrapper type={'desktop'} />
                    </Suspense>
                </div>
            </aside>
            <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900">
                <div className="p-5 min-h-full h-full overflow-y-auto">
                    <div className="relative flex justify-center items-center">
                        <div className="absolute left-0 xl:hidden">
                            <Suspense fallback={null}>
                                <SidebarWrapper type={'mobile'} />
                            </Suspense>
                        </div>
                        <h1 className="text-3xl leading-none">Jobs</h1>
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

async function SidebarWrapper({ type }) {
    const orgs = await getOrgs();
    const states = await getStates();

    // await new Promise(resolve => setTimeout(resolve, 2000));

    return (
        <>
            {
                type === 'desktop' ? <DesktopSidebar orgs={orgs} states={states} /> : <MobileSidebar orgs={orgs} states={states} />
            }
        </>
    )
}

async function MainContentWrapper({ searchParams }) {
    const sp = await searchParams;
    const key = JSON.stringify(sp);
    return (
        <>
            <JobsHeader />
            <Suspense key={key} fallback={<SearchListSkeleton type={'job'} />}>
                <MainContent searchParams={sp} />
            </Suspense>
        </>
    )
}

async function MainContent({ searchParams }) {
    const { search, org: orgSlug, rStatus, sector, qualification, expLvl, location } = searchParams;
    const jobs = await getJobs({ search, orgSlug, rStatus, sector, qualification, expLvl, location });

    await new Promise(resolve => setTimeout(resolve, 2000));

    return <JobsList jobs={jobs} />
}