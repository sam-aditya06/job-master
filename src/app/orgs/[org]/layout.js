export default function OrgLayout({ children }) {

    return (
        <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
            <section className="sm:flex-[75] xl:flex-[8] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900 overflow-hidden">
                <div className="p-3 min-h-full h-full overflow-hidden">
                    <div className="p-2 h-full overflow-y-auto">
                        {children}
                    </div>
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