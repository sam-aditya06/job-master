import { Suspense } from "react";
import { redirect } from "next/navigation";

import { SearchListSkeleton, SearchMainSectionSkeleton, SidebarSkeleton } from "@/components/skeletons";
import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import { getJobs, getNameFromSlug, getOrgs, getStates } from "@/lib/serverUtils";
import JobsHeader from "./jobsHeader";
import JobsList from "./jobsList";
import { FilterProvider } from "@/lib/context/filterContext";
import ScrollContainer from "@/components/scrollContainer";

export async function generateMetadata({ searchParams }) {
    const { search, sector, org, expLvl, location, rStatus, qualification } = await searchParams;

    const isSingleSectorFilter = sector && !org && !expLvl && !location && !rStatus && !qualification && !search;
    const isSingleOrgFilter = org && !sector && !expLvl && !location && !rStatus && !qualification && !search;
    const isIndexed = isSingleSectorFilter || isSingleOrgFilter || (!sector && !org && !expLvl && !location && !rStatus && !qualification && !search);

    const canonical = sector
        ? `${process.env.NEXT_PUBLIC_DOMAIN}/jobs?sector=${sector}`
        : org
            ? `${process.env.NEXT_PUBLIC_DOMAIN}/jobs?org=${org}`
            : `${process.env.NEXT_PUBLIC_DOMAIN}/jobs`

    const sectorMeta = {
        "central-govt": {
            title: "Central Government Jobs | Sarkari Naukri",
            description: "Browse all central government job roles in India. Find IAS, IPS, IFS, and other civil service posts with eligibility and job details."
        },
        "state-govt": {
            title: "State Government Jobs | Sarkari Naukri",
            description: "Browse state government job roles across India. Find state civil service posts, eligibility criteria, and responsibilities."
        },
        "psu": {
            title: "PSU Jobs | Sarkari Naukri",
            description: "Browse Public Sector Undertaking job roles in India. Find PSU posts across ONGC, BHEL, NTPC, and more with full job details."
        },
        "banking": {
            title: "Government Banking Jobs | Sarkari Naukri",
            description: "Browse government banking job roles in India. Find SBI, RBI, NABARD, and other public sector bank posts with eligibility and perks."
        },
        "defence": {
            title: "Defence Jobs | Sarkari Naukri",
            description: "Browse defence job roles in India. Find Army, Navy, Air Force, and other defence posts with eligibility and physical standards."
        },
        "railways": {
            title: "Railways Jobs | Sarkari Naukri",
            description: "Browse Indian Railways job roles. Find RRB posts across all railway zones with eligibility, responsibilities, and perks."
        },
        "judiciary": {
            title: "Judiciary Jobs | Sarkari Naukri",
            description: "Browse judiciary job roles in India. Find court clerk, stenographer, and judicial service posts with eligibility and details."
        },
        "police": {
            title: "Police Jobs | Sarkari Naukri",
            description: "Browse police job roles in India. Find constable, SI, and officer posts with eligibility, physical standards, and perks."
        }
    }

    let meta
    if (isSingleSectorFilter && sectorMeta[sector]) {
        meta = sectorMeta[sector]
    } else if (isSingleOrgFilter) {
        const orgName = await getNameFromSlug('orgs', org);
        meta = {
            title: `${orgName} Jobs | All ${orgName} Govt Roles`,
            description: `Browse all job roles at ${orgName}. Find eligibility criteria, responsibilities, perks, and latest recruitment details for every post.`
        }
    } else {
        meta = {
            title: "Govt Jobs | Sarkari Naukri — Browse All Government Roles",
            description: "Browse all government job roles across central, state, PSU, banking, defence, railways, and more. Find eligibility, responsibilities, and perks for every govt post."
        }
    }

    return {
        ...meta,
        alternates: { canonical },
        robots: isIndexed
            ? { index: true, follow: true }
            : { index: false, follow: true }
    }
}

export default async function JobsPage({ searchParams }) {

    const sp = await searchParams;

    const { page } = sp;

    const pageNum = page ? parseInt(page) : 1;
    if (isNaN(pageNum) || pageNum < 1)
        redirect('/jobs');

    return (
        <FilterProvider initialParams={sp}>
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
    const { orgs } = await getOrgs({});
    const states = await getStates();

    return (
        <>
            {
                type === 'desktop' ? <DesktopSidebar orgs={orgs} states={states} /> : <MobileSidebar orgs={orgs} states={states} />
            }
        </>
    )
}

async function MainContentWrapper({ sp }) {
    const { search, org: orgSlug, rStatus, sector, qualification, expLvl, location, page } = sp;
    const [{ itemCount, jobs }, orgName] = await Promise.all([
        getJobs({ search, orgSlug, rStatus, sector, qualification, expLvl, location, page }),
        orgSlug ? await getNameFromSlug('orgs', orgSlug) : undefined
    ]);
    return (
        <>
            <JobsHeader org={orgName} />
            <JobsList itemCount={itemCount} currentPage={page ? parseInt(page) : page} jobs={jobs} />
        </>
    )
}