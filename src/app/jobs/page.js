import { Suspense } from "react";
import { redirect } from "next/navigation";

import { SearchMainSectionSkeleton, SidebarSkeleton } from "@/components/skeletons";
import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import { getJobs, getJobsFilters, getJobsMetadata, getNameFromSlug, getOrgs, getStates } from "@/lib/serverUtils";
import JobsHeader from "./jobsHeader";
import JobsList from "./jobsList";
import { FilterProvider } from "@/lib/context/filterContext";
import ScrollContainer from "@/components/scrollContainer";

export async function generateMetadata({ searchParams }) {
    const { search, org, rStatus, sector, cat, qualification, expLvl, location } = await searchParams

    const [meta, { itemCount }] = await Promise.all([
        getJobsMetadata({ org, rStatus, sector, cat, qualification, expLvl, location }),
        getJobs({ org, rStatus, sector, cat, qualification, expLvl, location })
    ])

    const buildCanonical = () => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/jobs`)
        const indexableParams = { org, rStatus, sector, cat, qualification, expLvl, location }
        Object.entries(indexableParams).forEach(([key, value]) => {
            if (value) url.searchParams.set(key, value)
        })
        return url.toString()
    }

    return {
        ...meta,
        alternates: {
            canonical: buildCanonical()
        },
        robots: (search || itemCount === 0)
            ? { index: false, follow: true }
            : { index: true, follow: true }
    }
}

export default async function JobsPage({ searchParams }) {

    const sp = await searchParams;

    const { search, org, rStatus, sector, cat, qualification, expLvl, location, page } = sp;

    const pageNum = page ? parseInt(page) : 1;
    if (isNaN(pageNum) || pageNum < 1 || (sector && org))
        redirect('/jobs');



    return (
        <FilterProvider initialParams={{ search, org, rStatus, sector, cat, qualification, expLvl, location, page }}>
            <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
                <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                    <div className="p-2 h-full">
                        <Suspense fallback={<SidebarSkeleton />}>
                            <SidebarWrapper type={'desktop'} />
                        </Suspense>
                    </div>
                </aside>
                <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900 p-3 overflow-hidden">
                    <ScrollContainer>
                        <div className="xl:hidden relative flex justify-center items-center">
                            <div className="absolute left-0 top-0">
                                <Suspense fallback={null}>
                                    <SidebarWrapper type={'mobile'} />
                                </Suspense>
                            </div>
                        </div>
                        <div className="sm:pr-3">
                            <Suspense fallback={<SearchMainSectionSkeleton type={'job'} />}>
                                <MainContentWrapper sp={sp} />
                            </Suspense>
                        </div>
                    </ScrollContainer>
                </section>
                <aside className="hidden sm:flex-[25] xl:flex-[2] sm:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                    <div className="flex flex-col p-2 h-full">
                        <div className="grow"></div>
                        <p className="justify-end text-center">Advertisement</p>
                    </div>
                </aside>
            </div>
        </FilterProvider>
    )
}

async function SidebarWrapper({ type }) {

    const jobsFilters = await getJobsFilters();

    return (
        <>
            {
                type === 'desktop' ? <DesktopSidebar jobsFilters={jobsFilters} /> : <MobileSidebar jobsFilters={jobsFilters} />
            }
        </>
    )
}

async function MainContentWrapper({ sp }) {
    const { search, org, rStatus, sector, cat, qualification, expLvl, location, page } = sp;
    const [{ itemCount, jobs }, orgName] = await Promise.all([
        getJobs({ search, org, rStatus, sector, cat, qualification, expLvl, location, page }),
        org ? getNameFromSlug('orgs', org) : undefined
    ]);

    return (
        <>
            <JobsHeader org={orgName} />
            <JobsList itemCount={itemCount} currentPage={page ? parseInt(page) : page} jobs={jobs} />
        </>
    )
}