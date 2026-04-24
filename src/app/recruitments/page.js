import { Suspense } from "react";

import { getNameFromSlug, getOrgs, getRecruiterNameFromSlug, getRecruiters, getRecruitments, getStates } from "@/lib/serverUtils";
import { SearchMainSectionSkeleton, SearchPageSkeleton, SidebarSkeleton } from "@/components/skeletons";
import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import RecruitmentsList from "./recruitmentsList";
import RecruitmentsHeader from "./recruitmentsHeader";

import { FilterProvider } from "@/lib/context/filterContext";
import { redirect } from "next/navigation";
import ScrollContainer from "@/components/scrollContainer";

export async function generateMetadata({ searchParams }) {
    const { sector, by, for: forOrg, status, search, expLvl, location, qualification } = await searchParams;

    const isSingleSectorFilter = sector && !by && !forOrg && !status && !search && !expLvl && !location && !qualification
    const isSingleByFilter = by && !sector && !forOrg && !status && !search && !expLvl && !location && !qualification
    const isSingleForFilter = forOrg && !sector && !by && !status && !search && !expLvl && !location && !qualification
    const isIndexed = isSingleSectorFilter || isSingleByFilter || isSingleForFilter || (!sector && !by && !forOrg && !status && !search && !expLvl && !location && !qualification)

    const canonical = isSingleSectorFilter
        ? `${process.env.NEXT_PUBLIC_DOMAIN}/recruitments?sector=${sector}`
        : isSingleByFilter
            ? `${process.env.NEXT_PUBLIC_DOMAIN}/recruitments?by=${by}`
            : isSingleForFilter
                ? `${process.env.NEXT_PUBLIC_DOMAIN}/recruitments?for=${forOrg}`
                : `${process.env.NEXT_PUBLIC_DOMAIN}/recruitments`

    const sectorMeta = {
        "central-govt": {
            title: "Central Government Recruitments | Latest Notifications",
            description: "Browse latest central government recruitment notifications. Find UPSC, SSC, and other civil service recruitments with stages and results."
        },
        "state-govt": {
            title: "State Government Recruitments | Latest Notifications",
            description: "Browse latest state government recruitment notifications. Find state PSC and other state-level recruitments with stages and results."
        },
        "psu": {
            title: "PSU Recruitments | Latest Notifications",
            description: "Browse latest PSU recruitment notifications. Find ONGC, BHEL, NTPC, and other public sector undertaking recruitments."
        },
        "banking": {
            title: "Banking Recruitments | Latest Bank Bharti Notifications",
            description: "Browse latest banking sector recruitment notifications. Find IBPS, SBI, RBI, and other public sector bank recruitments."
        },
        "defence": {
            title: "Defence Recruitments | Latest Notifications",
            description: "Browse latest defence recruitment notifications. Find Army, Navy, Air Force, and other defence recruitments with stages and results."
        },
        "railways": {
            title: "Railways Recruitments | Latest Notifications",
            description: "Browse latest Indian Railways recruitment notifications. Find RRB and other railway recruitments with stages and results."
        },
        "judiciary": {
            title: "Judiciary Recruitments | Latest Notifications",
            description: "Browse latest judiciary recruitment notifications. Find court and judicial service recruitments with stages and results."
        },
        "police": {
            title: "Police Recruitments | Latest Notifications",
            description: "Browse latest police recruitment notifications. Find constable, SI, and officer level recruitments with stages and results."
        }
    }

    let meta
    if (isSingleSectorFilter && sectorMeta[sector]) {
        meta = sectorMeta[sector]
    } else if (isSingleByFilter) {
        const recruiterName = await getRecruiterNameFromSlug(by)
        meta = {
            title: `${recruiterName} Recruitments | All ${recruiterName} Notifications`,
            description: `Browse all recruitments conducted by ${recruiterName}. Find notifications, stages, and results for every ${recruiterName} recruitment.`
        }
    } else if (isSingleForFilter) {
        const orgName = await getNameFromSlug("orgs", forOrg)
        meta = {
            title: `${orgName} Recruitment Notifications | Latest Bharti`,
            description: `Browse all recruitments offering posts at ${orgName}. Find notifications, eligibility, and results.`
        }
    } else {
        meta = {
            title: "Government Recruitments | Latest Sarkari Bharti",
            description: "Browse latest government recruitment notifications. Find ongoing and upcoming recruitments across banking, defence, railways, PSU, and more."
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

export default async function RecruitmentsPage({ searchParams }) {
    const sp = await searchParams;

    const { page } = sp;

    const pageNum = page ? parseInt(page) : 1;
    if (isNaN(pageNum) || pageNum < 1)
        redirect('/recruitments');

    return (
        <FilterProvider initialParams={sp}>
            <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
                <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                    <div className="p-2 h-full">
                        <Suspense fallback={<SidebarSkeleton />}>
                            <Sidebar type={'desktop'} />
                        </Suspense>
                    </div>
                </aside>
                <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900 p-3 overflow-hidden">
                    <ScrollContainer>
                        <div className="xl:hidden relative flex justify-center items-center">
                            <div className="absolute left-0 top-0">
                                <Suspense fallback={null}>
                                    <Sidebar type={'mobile'} />
                                </Suspense>
                            </div>
                        </div>
                        <div className="sm:pr-3">
                            <Suspense fallback={<SearchMainSectionSkeleton type={'recruitment'} />}>
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

async function Sidebar({ type }) {
    const { orgs } = await getOrgs({});
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

async function MainContentWrapper({ sp }) {
    const { search, for: forSlug, by: bySlug, status, sector, qualification, expLvl, location, page } = sp;

    const [{ itemCount, recruitments }, forOrg, by] = await Promise.all([
        getRecruitments({ search, forSlug, bySlug, status, sector, qualification, expLvl, location, page }),
        forSlug ? getNameFromSlug('orgs', forSlug) : undefined,
        bySlug ? getRecruiterNameFromSlug(bySlug) : undefined,
    ]);

    return (
        <>
            <RecruitmentsHeader forOrg={forOrg} by={by} />
            <RecruitmentsList itemCount={itemCount} currentPage={page ? parseInt(page) : page} recruitments={recruitments} />
        </>
    )
}