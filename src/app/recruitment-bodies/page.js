import { Suspense } from "react";

import RecruitmentBodies from "./recruitmentBodiesList";
import { SearchListSkeleton } from "@/components/skeletons";
import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import { getRecruitmentBodies } from "@/lib/serverUtils";
import RecruitmentBodiesHeader from "./recruitmentBodiesHeader";
import RecruitmentBodiesList from "./recruitmentBodiesList";

export async function generateMetadata({ searchParams }) {
    const { sector, search } = await searchParams

    const isSingleSectorFilter = sector && !search
    const isIndexed = isSingleSectorFilter || (!sector && !search)

    const canonical = isSingleSectorFilter
        ? `${process.env.NEXT_PUBLIC_DOMAIN}/recruitment-bodies?sector=${sector}`
        : `${process.env.NEXT_PUBLIC_DOMAIN}/recruitment-bodies`

    const sectorMeta = {
        "central-govt": {
            title: "Central Government Recruitment Bodies | Kendra Sarkar",
            description: "Browse central government recruitment bodies in India. Find UPSC, SSC, and other central recruiting organisations with their latest recruitments."
        },
        "state-govt": {
            title: "State Government Recruitment Bodies | State PSCs & More",
            description: "Browse state government recruitment bodies across India. Find state PSCs and other state-level recruiting organisations with their latest recruitments."
        },
        "psu": {
            title: "PSU Recruitment Bodies | Public Sector Recruiters",
            description: "Browse PSU recruitment bodies in India. Find recruiting organisations for ONGC, BHEL, NTPC, and other public sector undertakings."
        },
        "banking": {
            title: "Banking Recruitment Bodies | IBPS, RBI & More",
            description: "Browse banking sector recruitment bodies in India. Find IBPS, RBI, and other public sector bank recruiting organisations."
        },
        "defence": {
            title: "Defence Recruitment Bodies | Army, Navy & Air Force Recruiters",
            description: "Browse defence recruitment bodies in India. Find recruiting organisations for Army, Navy, Air Force, and other defence services."
        },
        "railways": {
            title: "Railways Recruitment Bodies | RRB & Railway Recruiters",
            description: "Browse Indian Railways recruitment bodies. Find RRB and other railway recruiting organisations with their latest recruitments."
        },
        "judiciary": {
            title: "Judiciary Recruitment Bodies | Court Recruiters in India",
            description: "Browse judiciary recruitment bodies in India. Find recruiting organisations for courts, tribunals, and other judicial services."
        },
        "police": {
            title: "Police Recruitment Bodies | Govt Police Recruiters",
            description: "Browse police recruitment bodies in India. Find recruiting organisations for state police, central armed forces, and other police services."
        }
    }

    const meta = isSingleSectorFilter && sectorMeta[sector]
        ? sectorMeta[sector]
        : {
            title: "Government Recruitment Bodies | UPSC, SSC, IBPS & More",
            description: "Browse government recruitment bodies in India. Find UPSC, SSC, IBPS, and other recruiting organisations with their latest recruitments."
        }

    return {
        ...meta,
        alternates: { canonical },
        robots: isIndexed
            ? { index: true, follow: true }
            : { index: false, follow: true }
    }
}

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
    const { search, sector } = sp;
    const key = JSON.stringify(sp);
    return (
        <>
            <RecruitmentBodiesHeader />
            <Suspense key={key} fallback={<SearchListSkeleton type={'org'} />}>
                <MainContent search={search} sector={sector} />
            </Suspense>
        </>
    )
}

async function MainContent({ search, sector }) {
    const recruitmentBodies = await getRecruitmentBodies(search, sector);

    await new Promise(resolve => setTimeout(resolve, 2000));

    return <RecruitmentBodiesList recruitmentBodies={recruitmentBodies} />
}