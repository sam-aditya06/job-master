import Link from "next/link";

import { Button } from "@/components/ui/button";
import { capitalize } from "@/lib/utils";
import JobCard from "@/components/cards/jobCard";

export default function Org({ orgDetails }) {
    return (
        <div>
            <section className="flex items-center gap-2">
                <div className="shrink-0 h-24 sm:h-48 w-24 sm:w-48 sm:p-4">
                    <img src={`${process.env.NEXT_PUBLIC_CDN_URL}/${orgDetails.logoSrc}`} />
                </div>
                <div className="grow flex flex-col gap-2 h-fit sm:h-40">
                    <h1 className="text-xl sm:text-2xl">{orgDetails.name} ({orgDetails.abbr})</h1>
                    <p className="pl-2 text-sm sm:text-base">Sector: {capitalize(orgDetails.sector)}</p>
                    <p className="pl-2 text-sm sm:text-base">Offical Website: <Link target="_blank" className="text-blue-500 dark:text-blue-300 underline" href={orgDetails.homeUrl}>{orgDetails.homeUrl}</Link></p>
                </div>
            </section>
            <section className="flex flex-col gap-2 mt-10">
                <h2 className="text-xl font-semibold">About this organisation:</h2>
                <p className="px-2 text-sm sm:text-base text-justify">{orgDetails.description}</p>
            </section>
            {
                !orgDetails.topJobs &&
                <section className="flex flex-col gap-5 mt-10">
                    <h2 className="text-xl font-semibold">Top Jobs:</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                        {
                            orgDetails.popularJobs.map(job => {
                                return <JobCard key={job._id} job={job} page={'job'} />
                            })
                        }
                    </div>
                    <Link className="mx-auto hover:bg-brand hover:text-white border border-brand text-brand rounded-md px-2 py-1" href={`/jobs?org=${orgDetails.slug}`}>
                        See All
                    </Link>
                </section>
            }
        </div>
    )
}