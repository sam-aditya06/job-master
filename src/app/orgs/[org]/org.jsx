import Link from "next/link";

import { deslugify } from "@/lib/utils";
import JobCard from "@/components/cards/jobCard";
import { ArrowRight } from "lucide-react";
import RecruitmentCard from "@/components/cards/recruitmentCard";
import statusConfig from "@/lib/statusConfig";

export default function Org({ orgDetails }) {
    return (
        <div className="sm:pr-3">
            <section className="flex items-center gap-4">
                <div className="shrink-0 flex justify-center items-center border rounded-full h-12 sm:h-24 w-12 sm:w-24 p-2">
                    <div className="rounded-full flex justify-center items-center bg-white w-full h-full overflow-hidden">
                        <img src={`${process.env.NEXT_PUBLIC_CDN_URL}/${orgDetails.logoSrc}`} />
                    </div>
                </div>
                <div className="grow flex flex-col gap-1 h-fit">
                    <h1 className="text-xl sm:text-2xl">{orgDetails.name}{orgDetails.abbr ? ` (${orgDetails.abbr})` : ''}</h1>
                    <p className="text-muted-foreground">{deslugify(orgDetails.sector)}</p>
                </div>
            </section>
            <section className="flex flex-col gap-2 mt-10">
                <h2 className="text-xl font-semibold">About this organisation:</h2>
                <p className="text-sm sm:text-base text-justify">{orgDetails.description}</p>
            </section>
            {
                orgDetails.popularJobs &&
                <section className="flex flex-col gap-8 mt-10">
                    <div className='flex justify-between items-center'>
                        <h2 className="text-xl font-semibold">Top Jobs</h2>
                        <Link className="link-btn group" href={`/jobs?org=${orgDetails.slug}`}>
                            See All <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                        {
                            orgDetails.popularJobs.map(job => {
                                return <JobCard key={job.name} job={job} page={'job'} />
                            })
                        }
                    </div>
                </section>
            }
            <section className="flex flex-col gap-8 mt-10">
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