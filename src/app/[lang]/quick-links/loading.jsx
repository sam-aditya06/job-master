export default function Loading() {
    return (
        <div className="flex flex-col gap-10">
            <div>
                <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 w-fit h-10 animate-pulse">
                    <p className="text-4xl text-transparent">Quick Links</p>
                </div>
                <div className="flex flex-col gap-1 mt-5">
                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 w-full h-5 animate-pulse"></div>
                    <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 w-full h-5 animate-pulse"></div>
                    <div className="sm:hidden border rounded-md bg-neutral-300 dark:bg-neutral-800 w-full h-5 animate-pulse"></div>
                    <div className="sm:hidden border rounded-md bg-neutral-300 dark:bg-neutral-800 w-full h-5 animate-pulse"></div>
                </div>
            </div>
            {
                Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-4">
                        <div className="border rounded-md bg-neutral-300 dark:bg-neutral-800 w-1/2 sm:w-1/3 md:w-1/4 h-7 animate-pulse"></div>
                        <div className="flex flex-col gap-1 pl-2">
                            {
                                Array.from({ length: 10 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-2 sm:w-1/2 md:w-1/3">
                                        <div className="border rounded-full bg-neutral-300 dark:bg-neutral-800 w-2 h-2 animate-pulse"></div>
                                        <div className="flex-1 border rounded-md bg-neutral-300 dark:bg-neutral-800 h-5 animate-pulse"></div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                ))
            }
        </div>
    )
}