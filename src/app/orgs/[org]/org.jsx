import Link from "next/link";

import { deslugify } from "@/lib/utils";
import JobCard from "@/components/cards/jobCard";
import { ArrowRight } from "lucide-react";
import RecruitmentCard from "@/components/cards/recruitmentCard";
import statusConfig from "@/lib/statusConfig";

export default function Org({ orgDetails }) {
    return (
        <div className="sm:pr-3">
            <section className="flex items-center gap-4 sm:gap-2">
                <div className="shrink-0 h-24 sm:h-48 w-24 sm:w-48 sm:py-4">
                    <img className="w-24 sm:w-40 h-24 sm:h-40" src={`${process.env.NEXT_PUBLIC_CDN_URL}/${orgDetails.logoSrc}`} />
                </div>
                <div className="grow flex flex-col gap-2 h-fit">
                    <h1 className="text-xl sm:text-2xl">{orgDetails.name}{orgDetails.abbr ? ` (${orgDetails.abbr})` : ''}</h1>
                    <p className="text-sm sm:text-base">Sector: {deslugify(orgDetails.sector)}</p>
                    <p className="text-sm sm:text-base">Offical Website: <Link target="_blank" className="text-blue-500 dark:text-blue-300 underline" href={orgDetails.homeUrl}>{orgDetails.homeUrl}</Link></p>
                </div>
            </section>
            <section className="flex flex-col gap-2 mt-10">
                <h2 className="text-xl font-semibold">About this organisation:</h2>
                <p className="text-sm sm:text-base text-justify">{orgDetails.description}</p>
            </section>
            {
                orgDetails.popularJobs &&
                <section className="flex flex-col gap-5 mt-10">
                    <div className='flex justify-between items-center'>
                        <h2 className="text-xl font-semibold">Top Jobs</h2>
                        <Link className="link-btn group" href={`/jobs?org=${orgDetails.slug}`}>
                            See All <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                        {
                            orgDetails.popularJobs.map(job => {
                                return <JobCard key={job._id} job={job} page={'job'} />
                            })
                        }
                    </div>
                </section>
            }
            <section className="flex flex-col gap-5 mt-10">
                <div className='flex justify-between items-center'>
                    <h2 className="text-xl font-semibold">Ongoing Recruitments</h2>
                    <Link className="link-btn group" href={`/recruitments?for=${orgDetails.slug}&status=ongoing`}>
                        See All <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
                    </Link>
                </div>
                {
                    orgDetails.ongoingRecruitments ?
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                            {
                                orgDetails.ongoingRecruitments.map(recruitment => {
                                    const key = Object.keys(statusConfig).filter(status => recruitment.stageStatus.includes(status));
                                    const { color, icon } = statusConfig[key];
                                    return <RecruitmentCard key={recruitment._id} recruitment={recruitment} color={color} icon={icon} page={'org'} />
                                })
                            }
                        </div> :
                        <div className="flex justify-center items-center h-48">
                            <p className="text-3xl text-muted-foreground">No ongoing recruitments</p>
                        </div>
                }
            </section>
        </div>
    )
}