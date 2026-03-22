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

export function QuickLinkListSkeleton() {
    return (
        <div className="grid grid-cols-3 gap-2">
            {
                Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 h-8 animate-pulse"></div>
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
            <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 w-2/3 h-9 animate-pulse"></div>
            <div className="flex flex-col gap-2 mt-4">
                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 h-6 animate-pulse"></div>
                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 h-6 animate-pulse"></div>
                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 h-6 animate-pulse"></div>
                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 h-6 animate-pulse"></div>
            </div>
            <div className="flex flex-col">
                {
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex flex-col">
                            <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 mt-6 px-2 py-1 h-8 w-1/3 animate-pulse"></div>
                            <div className="flex flex-col gap-2 mt-4">
                                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 h-6 animate-pulse"></div>
                                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 h-6 animate-pulse"></div>
                                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 h-6 animate-pulse"></div>
                                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 px-2 py-1 h-6 animate-pulse"></div>
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
                        <div className="border rounded-full bg-neutral-300 dark:bg-neutral-800 h-6 w-2/3 animate-pulse"></div>
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
        <>
            <section className="flex items-center gap-2">
                <div className="h-48 w-48 p-4">
                    <div className="rounded-full bg-neutral-300 dark:bg-neutral-800 w-40 h-40 animate-pulse"></div>
                </div>
                <div className="grow flex flex-col gap-2 h-40">
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
        </>
    )

}