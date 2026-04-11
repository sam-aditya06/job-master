import { Suspense } from "react";

import OrgsHeader from "./orgsHeader";
import { OrgListSkeleton, SearchListSkeleton, SidebarSkeleton } from "@/components/skeletons";
import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import { getOrgs, getStates } from "@/lib/serverUtils";
import OrgsList from "./orgsList";

export async function generateMetadata({ searchParams }) {
    const { sector, search } = await searchParams

    const isSingleSectorFilter = sector && !search
    const isIndexed = isSingleSectorFilter || (!sector && !search)

    const canonical = isSingleSectorFilter
        ? `${process.env.NEXT_PUBLIC_DOMAIN}/orgs?sector=${sector}`
        : `${process.env.NEXT_PUBLIC_DOMAIN}/orgs`

    const sectorMeta = {
        "central-govt": {
            title: "Central Government Organisations | Sarkari Vibhag",
            description: "Browse central government organisations in India. Find ministries, departments, and central govt bodies with their jobs and recruitments."
        },
        "state-govt": {
            title: "State Government Organisations | Rajya Sarkar Vibhag",
            description: "Browse state government organisations across India. Find state departments and bodies with their jobs and recruitments."
        },
        "psu": {
            title: "Public Sector Undertakings | PSU Organisations in India",
            description: "Browse PSU organisations in India. Find ONGC, BHEL, NTPC, and other public sector undertakings with their jobs and recruitments."
        },
        "banking": {
            title: "Government Banking Organisations | Public Sector Banks",
            description: "Browse public sector banking organisations in India. Find SBI, RBI, NABARD, and other govt banks with their jobs and recruitments."
        },
        "defence": {
            title: "Defence Organisations in India | Govt Defence Bodies",
            description: "Browse defence organisations in India. Find Army, Navy, Air Force, and other defence bodies with their jobs and recruitments."
        },
        "railways": {
            title: "Indian Railways Organisations | Railway Zones & Boards",
            description: "Browse Indian Railways organisations. Find railway zones, boards, and bodies with their jobs and recruitments."
        },
        "judiciary": {
            title: "Judiciary Organisations in India | Courts & Tribunals",
            description: "Browse judiciary organisations in India. Find courts, tribunals, and judicial bodies with their jobs and recruitments."
        },
        "police": {
            title: "Police Organisations in India | Govt Police Bodies",
            description: "Browse police organisations in India. Find state police, central armed forces, and other police bodies with their jobs and recruitments."
        }
    }

    const meta = isSingleSectorFilter && sectorMeta[sector]
        ? sectorMeta[sector]
        : {
            title: "Government Organisations | Browse PSUs, Banks & More",
            description: "Browse government organisations in India. Find PSUs, banks, defence, railways, and other govt organisations with their jobs and recruitments."
        }

    return {
        ...meta,
        alternates: { canonical },
        robots: isIndexed
            ? { index: true, follow: true }
            : { index: false, follow: true }
    }
}

export default function OrgsPage({ searchParams }) {

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
                    <div className="relative flex justify-center items-center">
                        <div className="absolute left-0 xl:hidden">
                            <Suspense fallback={<SidebarSkeleton />}>
                                <MobileSidebar />
                            </Suspense>
                        </div>
                        <h1 className="text-3xl leading-none">Organisations</h1>
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
            <OrgsHeader />
            <Suspense key={key} fallback={<SearchListSkeleton type={'org'} />}>
                <MainContent searchParams={searchParams} />
            </Suspense>
        </>
    )
}

async function MainContent({ searchParams }) {
    const { search, sector } = await searchParams;
    const orgs = await getOrgs(search, sector);

    await new Promise(resolve => setTimeout(resolve, 5000));

    return <OrgsList orgs={orgs} />
}