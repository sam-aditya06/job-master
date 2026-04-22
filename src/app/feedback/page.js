import Feedback from "./feedback"

export const metadata = {
  title: `Feedback | ${process.env.NEXT_PUBLIC_NAME}`,
  description: `Report wrong information, missing jobs, or share your feedback with the ${process.env.NEXT_PUBLIC_NAME} team.`,
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/feedback`
  }
}

export default function FeedbackPage() {
  return (
    <div className="flex mx-auto max-w-7xl gap-2 sm:py-2 sm:max-[1281px]:px-2 min-h-[calc(100dvh-7rem)] sm:h-[calc(100dvh-7rem)] overflow-hidden">
      <section className="sm:flex-[75] xl:flex-[8] sm:rounded-md bg-white dark:bg-background dark:sm:bg-neutral-900 p-3 overflow-hidden">
        <div className="p-2 min-h-full h-full overflow-y-auto">
          <Feedback />
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