//For Search Page Filter Chips
export function ChipSkeleton() {
    return (
        <div className="rounded-full bg-neutral-300 dark:bg-neutral-800 h-8 w-1/6 animate-pulse"></div>
    )
}

//For main section (header + item lists) of Search Pages
export function SearchMainSectionSkeleton({ type }) {
    return (
        <div className="flex flex-col gap-7">
            <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 mx-auto w-1/3 h-9 animate-pulse"></div>
            <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-9 animate-pulse"></div>
            <div className="flex flex-wrap items-center gap-2">
                <p>Filters:</p>
                {
                    Array.from({ length: 4 }).map((_, i) => (
                        <ChipSkeleton key={i} />
                    ))
                }
            </div>
            <SearchListSkeleton type={type} />
        </div>
    )
}

//For loading.jsx of Search Pages
export function SearchPageSkeleton({ type }) {
    return (
        <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
            <aside className="hidden xl:flex-[2] xl:flex flex-col rounded-md bg-white dark:bg-neutral-900">
                <div className="p-2 h-full">
                    <SidebarSkeleton />
                </div>
            </aside>
            <section className="flex-1 sm:flex-[75] xl:flex-[6] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900 p-3">
                <div className="flex flex-col gap-10 p-2 h-full overflow-y-auto">
                    <div className="xl:hidden relative flex justify-center items-center">
                        <div className="absolute left-0 top-0">
                            <div className="h-6 w-6 rounded-md bg-neutral-300 dark:bg-neutral-800"></div>
                        </div>
                    </div>
                    <div className="sm:pr-3">
                        <SearchMainSectionSkeleton type={type} />
                    </div>
                </div>
            </section>
            <aside className="hidden sm:flex-[25] xl:flex-[2] sm:flex flex-col rounded-md bg-white dark:bg-neutral-900">
            </aside>
        </div>
    )
}

//For item lists of Search Pages
export function SearchListSkeleton({ type }) {
    return (
        <div className="flex flex-col gap-5 mt-5">
            <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-8 w-1/3 animate-pulse"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            {type === 'job' && <JobCardSkeleton />}
                            {type === 'recruitment' && <RecruitmentCardSkeleton />}
                            {type === 'org' && <OrgCardSkeleton />}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

//For Quick Links Page
export function QuickLinkListSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-2">
            {
                Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-8 animate-pulse"></div>
                ))
            }
        </div>
    )
}

export function SidebarSkeleton() {
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

export function ContentSkeleton() {
    return (
        <div className="flex flex-col p-3">
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
    )
}

export function JobCardSkeleton() {
    return (
        <div className='border rounded-xl p-5 h-full'>
            <div className='flex justify-between items-center gap-2 px-0'>
                <div className='flex flex-col w-full'>
                    <div className="mb-3">
                        <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 mb-1 w-1/5 h-4 animate-pulse"></div>
                        <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 mb-1 w-2/3 h-7 animate-pulse"></div>
                        <div className="flex items-center gap-1 mb-3 w-full">
                            <div className="border rounded-full bg-neutral-300 dark:bg-neutral-800 h-3 w-3 animate-pulse"></div>
                            <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 h-3 w-1/3 animate-pulse"></div>
                        </div>
                    </div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 mb-4 h-9 animate-pulse'></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                        <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                        <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    </div>
                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-7 animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export function OrgCardSkeleton() {
    return (
        <div className='border rounded-xl p-5 h-full'>
            <div className='flex flex-col gap-4 w-full'>
                <div className="flex items-center gap-2">
                    <div className="shrink-0 border w-18 h-18 rounded-full p-1.5 overflow-hidden">
                        <div className="border rounded-full bg-neutral-300 dark:bg-neutral-800 w-full h-full animate-pulse"></div>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                        <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 h-6 w-2/3 animate-pulse"></div>
                        <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 h-5 w-1/3 animate-pulse"></div>
                    </div>
                </div>
                <div className="flex flex-col gap-1 w-full">
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-4 animate-pulse'></div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-4 animate-pulse'></div>
                    <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-4 animate-pulse'></div>
                </div>
                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-7 animate-pulse"></div>
            </div>
        </div>
    )
}

export function RecruitmentCardSkeleton() {
    return (
        <div className='border rounded-xl p-5 h-full'>
            <div className='flex flex-col px-0 w-full h-full'>
                <div className="flex items-start justify-between mb-2">
                    <div className="w-1/3">
                        <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 mb-1 w-4/5 h-4 animate-pulse"></div>
                        <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-7 animate-pulse"></div>
                    </div>
                    <div className="border rounded-sm bg-neutral-300 dark:bg-neutral-800 w-1/3 h-6 animate-pulse"></div>
                </div>
                <div className="grow flex flex-col justify-between">
                    <div className="grow border rounded-sm bg-neutral-300 dark:bg-neutral-800 h-4 sm:h-9 mb-2 animate-pulse"></div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                        <div className='border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                        <div className='flex-[5] border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse'></div>
                    </div>
                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 h-7 animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}

export function OrgsPageSkeleton({ type }) {

    return (
        <div className="sm:pr-3">
            <section className="flex items-center gap-4 sm:gap-2">
                <div className="h-24 sm:h-48 w-24 sm:w-48 sm:py-4">
                    <div className="rounded-full bg-neutral-300 dark:bg-neutral-800 w-24 sm:w-40 h-24 sm:h-40 animate-pulse"></div>
                </div>
                <div className="grow flex flex-col gap-2 h-fit">
                    <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-8 w-1/2 animate-pulse"></div>
                    <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-6 w-1/6 animate-pulse"></div>
                    <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-6 w-1/6 animate-pulse"></div>
                </div>
            </section>
            <section className="flex flex-col gap-2 mt-10">
                <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-7 w-1/6 animate-pulse"></div>
                <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-4 w-full animate-pulse"></div>
                <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-4 w-full animate-pulse"></div>
                <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-4 w-full animate-pulse"></div>
                <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-4 w-full animate-pulse"></div>
            </section>
            <section className="flex flex-col gap-5 mt-10">
                <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-7 w-24 animate-pulse"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                    {
                        Array.from({ length: 6 }).map((_, i) => (
                            <div key={i}>
                                {type === 'org' && <JobCardSkeleton key={i} />}
                                {type === 'rBody' && <RecruitmentCardSkeleton key={i} />}
                            </div>
                        ))
                    }
                </div>
            </section>
        </div>
    )

}

//For Home Page's "Recent Recruitments" and "Popular Jobs" Sections
export function HomeSectionSkeleton({ type }) {
    return (
        <div className="w-9/10 xl:w-6xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 mb-10">
                <div className="grow flex flex-col gap-1">
                    <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-8 w-1/4 animate-pulse"></div>
                    <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 w-2/3 animate-pulse"></div>
                </div>
                <div className="rounded-md bg-neutral-300 dark:bg-neutral-800 h-8 w-1/6 animate-pulse"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i}>
                            {type === 'recruitment' && <RecruitmentCardSkeleton />}
                            {type === 'job' && <JobCardSkeleton />}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}