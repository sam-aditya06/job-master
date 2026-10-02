import { PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

//For Search Page Filter Chips
export function ChipSkeleton() {
    return (
        <div className="rounded-full bg-neutral-300 dark:bg-neutral-800 h-8 w-1/6 animate-pulse"></div>
    )
}

//For main section (header + item lists) of Search Pages
export function SearchMainSectionSkeleton({ type }) {
    return (
        <>
            <div className="flex flex-col gap-7">
                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 mx-auto w-1/3 h-9 animate-pulse"></div>
                <div className="flex gap-2">
                    <div className="grow border rounded-md bg-neutral-300 dark:bg-neutral-800 h-9 animate-pulse"></div>
                    <div className="lg:hidden border rounded-md bg-neutral-300 dark:bg-neutral-800 w-9 h-9 animate-pulse"></div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <p>Filters:</p>
                    {
                        Array.from({ length: 4 }).map((_, i) => (
                            <ChipSkeleton key={i} />
                        ))
                    }
                </div>
            </div>
            <div className="flex flex-col gap-10">
                <SearchListSkeleton type={type} />
            </div>
        </>
    )
}

//For loading.jsx of Search Pages
export function SearchPageSkeleton({ type }) {
    return (
        // <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
        //     <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
        //         <div className="p-2 h-full">
        //             <SidebarSkeleton />
        //         </div>
        //     </aside>
        //     <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900 p-3">
        //         <div className="flex flex-col gap-10 p-2 h-full overflow-y-auto">
        //             <div className="xl:hidden relative flex justify-center items-center">
        //                 <div className="absolute left-0 top-0">
        //                     <div className="h-6 w-6 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
        //                 </div>
        //             </div>
        //             <div className="sm:pr-3">
        //                 <SearchMainSectionSkeleton type={type} />
        //             </div>
        //         </div>
        //     </section>
        //     <aside className="hidden sm:flex-[25] xl:flex-[2] sm:flex flex-col rounded-md bg-white dark:bg-neutral-900">
        //     </aside>
        // </div>
        <div className="flex mx-auto max-w-7xl gap-2 lg:p-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
            <aside className="hidden lg:flex-[25] xl:flex-[2] lg:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                <div className="p-2 h-full">
                    <SidebarSkeleton />
                </div>
            </aside>
            <section className="flex-1 lg:flex-[75] xl:flex-[8] lg:rounded-md bg-white dark:bg-background dark:lg:bg-neutral-900 p-3 overflow-hidden">
                <div className="flex flex-col gap-10 p-2 h-full overflow-y-auto">
                    <div className="lg:hidden relative flex justify-center items-center">
                        <div className="absolute left-0 top-0">
                            <div className="h-6 w-6 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        </div>
                    </div>
                    <div className="sm:pr-3">
                        <SearchMainSectionSkeleton type={type} />
                    </div>
                </div>
            </section>
        </div>
    )
}

//For item lists of Search Pages
export function SearchListSkeleton({ type }) {
    return (
        <div className="flex flex-col gap-5 mt-5">
            <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-8 w-1/3 animate-pulse"></div>
            <div className="hidden sm:grid grid-cols-1 gap-4">
                {
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                            {type === 'job' && <JobCardV1Skeleton />}
                            {type === 'recruitment' && <RecruitmentCardV1Skeleton />}
                        </div>
                    ))
                }
            </div>
            <div className="sm:hidden grid grid-cols-1 gap-4">
                {
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                            {type === 'job' && <JobCardV2Skeleton />}
                            {type === 'recruitment' && <RecruitmentCardV2Skeleton />}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export function JobSidebarSkeleton() {
    return (
        <div className="p-2 space-y-6 animate-pulse">

            <div className="space-y-2">
                <div className="h-6 w-24 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>

            <div className="space-y-2">
                <div className="h-6 w-20 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>

            <div className="space-y-3">
                <div className="h-6 w-32 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center gap-3">
                        <div className="h-4 w-32 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                        <div className="h-4 w-28 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                        <div className="h-4 w-36 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="h-5 w-28 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center gap-3">
                        <div className="h-4 w-24 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>

                    <div className="flex justify-between items-center gap-3">
                        <div className="h-4 w-32 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function JobsSidebarSkeleton() {
    return (
        <div className="p-2 space-y-5 animate-pulse">

            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>

            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-3 w-1/2 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="h-3 w-1/2 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="h-3 w-1/2 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>

            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>
            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>
            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-3 w-1/2 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="h-3 w-1/2 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function RecruitmentSidebarSkeleton() {
    return (
        <div className="p-2 space-y-5 animate-pulse">
            <div className="mt-5 h-8 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            <div className="h-6 w-1/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>

            <div className="flex flex-col">
                {
                    Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="flex flex-col">
                            <div className="flex gap-2 items-center w-full">
                                <div className="h-5 w-5 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                                <div className="h-5 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                            </div>
                            {i !== 9 && <div className="border border-neutral-300 dark:border-neutral-800 ml-[0.6rem] w-0 h-6"></div>}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export function RecruitmentsSidebarSkeleton() {
    return (
        <div className="mt-12 lg:mt-0 p-2 space-y-5 animate-pulse">

            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>

            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>

            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-3 w-1/2 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="h-3 w-1/2 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="h-3 w-1/2 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>

            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>
            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="h-9 w-full rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
            </div>
            <div className="space-y-3">
                <div className="h-3 w-2/3 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                <div className="space-y-2">
                    <div className="flex justify-between">
                        <div className="h-3 w-1/2 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                    <div className="flex justify-between">
                        <div className="h-3 w-1/2 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        <div className="h-4 w-4 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export function ContentSkeleton() {
    return (
        <>
            <Button className='sm:hidden fixed border border-white/15 shadow-md bg-white dark:bg-neutral-800 !p-0 w-10 h-10'>
                <PanelLeftOpen className="!w-6 !h-6 stroke-brand dark:stroke-white" />
            </Button>
            <div className="flex flex-col mt-14 lg:mt-0 px-3">
                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 w-2/3 h-9 animate-pulse"></div>
                <div className="flex flex-col gap-2 mt-4">
                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse"></div>
                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse"></div>
                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse"></div>
                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                    {
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex flex-col">
                                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 mt-6 h-8 w-1/3 animate-pulse"></div>
                                <div className="flex flex-col gap-2 mt-4">
                                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse"></div>
                                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse"></div>
                                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse"></div>
                                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse"></div>
                                </div>
                            </div>
                        ))
                    }
                </div>

            </div>
        </>
    )
}

export function JobCardV1Skeleton() {
    return (
        <div className='border rounded-xl p-4 h-full'>
            <div className='flex flex-col gap-3 w-full px-0'>
                <div className="flex justify-between w-full">
                    <div className="flex flex-col gap-1 w-full">
                        <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/8 h-[10px] animate-pulse"></div>
                        <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 w-1/3 h-7 animate-pulse"></div>
                        <div className="flex items-center gap-1 w-full">
                            <div className="border rounded-full bg-neutral-300 dark:bg-neutral-800 h-6 w-6 animate-pulse"></div>
                            <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 h-4 w-1/4 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="rounded-full bg-neutral-300 dark:bg-neutral-800 w-1/4 h-7"></div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                    {
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className='border rounded-full bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse'></div>
                        ))
                    }
                </div>
                <div className="flex items-center gap-3">
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                </div>
                <div className="flex justify-between border-t pt-3">
                    <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/5 h-4 animate-pulse"></div>
                    <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/5 h-4 animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export function JobCardV2Skeleton() {
    return (
        <div className='border rounded-xl p-4 h-full'>
            <div className='flex flex-col gap-3 w-full px-0'>
                <div className="flex justify-between w-full">
                    <div className="flex flex-col gap-1 w-full">
                        <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 mb-1 w-1/5 h-[10px] animate-pulse"></div>
                        <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 mb-1 w-2/3 h-7 animate-pulse"></div>
                        <div className="flex items-center gap-1 w-full">
                            <div className="border rounded-full bg-neutral-300 dark:bg-neutral-800 h-5 w-5 animate-pulse"></div>
                            <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 h-4 w-1/3 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {
                        Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className='border rounded-full bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse'></div>
                        ))
                    }
                </div>
                <div className="flex items-center gap-3">
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                </div>
                <div className="flex justify-between border-t pt-3">
                    <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/4 h-4 animate-pulse"></div>
                    <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/4 h-4 animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export function RecruitmentCardV1Skeleton() {
    return (
        <div className='border rounded-xl p-4 h-full'>
            <div className='flex flex-col gap-3 w-full px-0'>
                <div className="flex justify-between w-full">
                    <div className="flex flex-col gap-1 w-full">
                        <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/8 h-[10px] animate-pulse"></div>
                        <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 w-1/3 h-7 animate-pulse"></div>
                        <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/2 h-4 animate-pulse"></div>
                    </div>
                    <div className="rounded-full bg-neutral-300 dark:bg-neutral-800 w-1/4 h-7"></div>
                </div>
                <div className="grid grid-cols-6 gap-2">
                    {
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className='border rounded-full bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse'></div>
                        ))
                    }
                </div>
                <div className="flex items-center gap-3">
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                </div>
                <div className="flex justify-between border-t pt-3">
                    <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/5 h-4 animate-pulse"></div>
                    <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/5 h-4 animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export function RecruitmentCardV2Skeleton() {
    return (
        <div className='border rounded-xl p-5 h-56'>
            <div className='flex flex-col gap-3 w-full px-0'>
                <div className="flex justify-between w-full">
                    <div className="flex flex-col gap-1 w-full">
                        <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/4 h-[10px] animate-pulse"></div>
                        <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 w-1/2 h-7 animate-pulse"></div>
                        <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-2/3 h-4 animate-pulse"></div>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-neutral-300 dark:bg-neutral-800"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {
                        Array.from({ length: 2 }).map((_, i) => (
                            <div key={i} className='border rounded-full bg-neutral-300 dark:bg-neutral-800 h-6 animate-pulse'></div>
                        ))
                    }
                </div>
                <div className="flex items-center gap-3">
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                </div>
                <div className="flex justify-between border-t pt-3">
                    <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/4 h-4 animate-pulse"></div>
                    <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/4 h-4 animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

//For Home Page's "Recent Recruitments" and "Popular Jobs" Sections
export function HomeSectionSkeleton({ type }) {
    return (
        <div className="w-full xl:w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
                <div className="grow flex flex-col gap-1">
                    <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 w-fit animate-pulse">
                        <p className="text-2xl font-bold text-transparent">
                            {type === 'recruitment' ? 'Ongoing Recruitments' : 'Popular Jobs'}
                        </p>
                    </div>
                    <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 w-fit animate-pulse">
                        <p className="text-sm text-transparent">
                            {
                                type === 'recruitment' ?
                                    'Track all your government recruitments in real-time.' :
                                    'Learn about responsibilities, perks & career growth of your dream jobs.'
                            }
                        </p>
                    </div>
                </div>
                <div className="max-sm:hidden rounded-md bg-neutral-300 dark:bg-neutral-800 h-8 w-1/6 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                            {type === 'recruitment' && <RecruitmentCardV2Skeleton />}
                            {type === 'job' && <JobCardV2Skeleton />}
                        </div>
                    ))
                }
            </div>
            <div className="sm:hidden rounded-md bg-neutral-300 dark:bg-neutral-800 mt-5 mx-auto h-8 w-1/5 animate-pulse"></div>
        </div>
    )
}