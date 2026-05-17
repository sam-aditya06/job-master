import { Suspense } from "react";
import { redirect } from "next/navigation";

import OrgsList from "./orgsList";

import OrgsHeader from "./orgsHeader";
import { SearchMainSectionSkeleton, SidebarSkeleton } from "@/components/skeletons";
import DesktopSidebar from "@/components/sidebars/desktopSidebar";
import MobileSidebar from "@/components/sidebars/mobileSidebar";
import ScrollContainer from "@/components/scrollContainer";

import { getOrgs, getOrgsFilters, getOrgsMetadata } from "@/lib/serverUtils";
import { FilterProvider } from "@/lib/context/filterContext";

export async function generateMetadata({ searchParams }) {
    const { search, sector, type } = await searchParams

    const [meta, { itemCount }] = await Promise.all([
        getOrgsMetadata({ sector }),
        getOrgs({ sector, type })
    ])

    const buildCanonical = () => {
        const url = new URL(`${process.env.NEXT_PUBLIC_DOMAIN}/orgs`)
        if (sector && !type) url.searchParams.set("sector", sector)
        return url.toString();
    }

    return {
        ...meta,
        alternates: {
            canonical: buildCanonical()
        },
        robots: (search || type || itemCount === 0)
            ? { index: false, follow: true }
            : { index: true, follow: true }
    }
}

export default async function OrgsPage({ searchParams }) {

    const sp = await searchParams;

    const { page } = sp;

    const pageNum = page ? parseInt(page) : 1;
    if (isNaN(pageNum) || pageNum < 1)
        redirect('/orgs');

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
                            <Suspense fallback={<SearchMainSectionSkeleton type={'org'} />}>
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

    const sectors = await getOrgsFilters();

    return (
        <>
            {
                type === 'desktop' ? <DesktopSidebar sectors={sectors} /> : <MobileSidebar sectors={sectors} />
            }
        </>
    )
}

async function MainContentWrapper({ sp }) {
    const { search, sector, type, page } = sp;
    const { itemCount, orgs } = await getOrgs({ search, sector, type, page: page || 1 });

    return (
        <>
            <OrgsHeader />
            <OrgsList itemCount={itemCount} currentPage={page ? parseInt(page) : page} orgs={orgs} />
        </>
    )
}