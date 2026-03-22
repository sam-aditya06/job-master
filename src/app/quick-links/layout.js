export default function QuickLinksLayout({ children }) {

    return (
        <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:h-[calc(100dvh-7rem)] overflow-hidden">
            <section className="sm:flex-[8] relative sm:border sm:rounded-md bg-white dark:bg-background dark:lg:bg-neutral-900 pb-5 h-full overflow-y-auto">
                {children}
            </section>
            <aside className="hidden sm:flex-[2] sm:flex flex-col rounded-md bg-white dark:bg-neutral-900 p-2">
                <div className="grow"></div>
                <p className="justify-end text-center">Advertisement</p>
            </aside>
        </div>
    )
}