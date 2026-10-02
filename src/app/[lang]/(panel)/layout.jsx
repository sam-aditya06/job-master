import { ContentLoadingProvider } from "@/lib/context/paginateContext";
import Sidebar from "@/components/sidebars/sidebar";
import { SidebarSkeleton } from "@/components/skeletons";
import { Suspense } from "react";
import ScrollProvider from "@/components/scrollProvider";
import { FilterProvider } from "@/lib/context/filterContext";


export default async function PanelLayout({ children }) {
    return (
        <FilterProvider>
            <ContentLoadingProvider>
                {/* <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
                        <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                            <div className="p-2 h-full">
                                <Suspense fallback={<SidebarSkeleton />}>
                                    <Sidebar screen='desktop' params={params} />
                                </Suspense>
                            </div>
                        </aside>
                        <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900 overflow-hidden">
                            <div className="p-3 min-h-full h-full overflow-hidden">
                                <ScrollProvider>
                                    <div className="xl:hidden">
                                        <Suspense fallback={null}>
                                            <Sidebar screen='mobile' params={params} />
                                        </Suspense>
                                    </div>
                                    <Suspense fallback={<ContentSkeleton />}>
                                        <MainContentWrapper params={params} searchParams={searchParams} />
                                    </Suspense>
                                </ScrollProvider>
                            </div>
                        </section>
                        <aside className="hidden sm:flex-[25] xl:flex-[2] sm:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                            <div className="flex flex-col p-2 h-full">
                                <div className="grow"></div>
                                <p className="justify-end text-center">Advertisement</p>
                            </div>
                        </aside>
                    </div> */}
                <div className="flex mx-auto max-w-7xl gap-2 lg:py-2 lg:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
                    <aside className="hidden lg:flex-[25] xl:flex-[2] lg:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                        <div className="p-2 h-full">
                            <Sidebar screen='desktop' />
                        </div>
                    </aside>
                    <section className="flex-1 lg:flex-[75] xl:flex-[8] lg:rounded-md bg-white dark:bg-background dark:lg:bg-neutral-900 p-3 overflow-hidden">
                        <ScrollProvider>
                            {children}
                        </ScrollProvider>
                    </section>
                </div>
            </ContentLoadingProvider>
        </FilterProvider>
    )
}