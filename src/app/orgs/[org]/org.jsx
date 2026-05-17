import Link from "next/link";

import { ArrowRight } from "lucide-react";

import JobCard from "@/components/cards/jobCard";
import RecruitmentCard from "@/components/cards/recruitmentCard";

import statusConfig from "@/lib/statusConfig";
import { getLogoStyles } from "@/lib/utils";

export default function Org({ orgDetails }) {
    const { name } = orgDetails;
    let { containerStyles, imgStyles } = getLogoStyles(name, false);
    return (
        <div className="sm:pr-3">
            <section className="flex items-center gap-4">
                <div className="shrink-0 flex justify-center items-center border rounded-full h-12 sm:h-24 w-12 sm:w-24 p-2">
                    <div
                        className="rounded-full flex justify-center items-center bg-white w-full h-full overflow-hidden"
                        style={containerStyles}
                    >
                        <img
                            style={imgStyles}
                            src={`${process.env.NEXT_PUBLIC_CDN_URL}/${orgDetails.logoSrc}`}
                        />
                    </div>
                </div>
                <div className="grow flex flex-col gap-1 h-fit">
                    <h1 className="text-xl sm:text-2xl">{orgDetails.name}{orgDetails.abbr ? ` (${orgDetails.abbr})` : ''}</h1>
                    <p className="text-muted-foreground">{orgDetails.sector.join(" / ")}</p>
                </div>
            </section>
            <section className="flex flex-col gap-2 mt-10">
                <h2 className="text-xl font-semibold">About this organisation:</h2>
                <p className="text-sm sm:text-base text-justify">{orgDetails.description}</p>
            </section>
            {
                orgDetails.popularJobs.length > 0 &&
                <section className="flex flex-col gap-8 mt-10">
                    <div className='flex justify-between items-center'>
                        <h2 className="text-xl font-semibold">Top Jobs</h2>
                        <Link className="link-btn group" href={`/jobs?org=${orgDetails.slug}`}>
                            See All <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                        {
                            orgDetails.popularJobs.slice(0, 3).map(job => {
                                return <JobCard key={job.name} job={job} page={'job'} />
                            })
                        }
                    </div>
                </section>
            }
            {
                orgDetails.topRecruitments.length > 0 &&
                <section className="flex flex-col gap-8 mt-10">
                    <div className='flex justify-between items-center'>
                        <h2 className="text-xl font-semibold">Top Recruitments by {orgDetails.abbr || orgDetails.name}</h2>
                        <Link className="link-btn group" href={`/recruitments?recruiter=${orgDetails.slug}`}>
                            See All <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                        {
                            orgDetails.topRecruitments.slice(0, 3).map(recruitment => {
                                const stageStatus = recruitment.stageStatus;
                                const key = Object.keys(statusConfig).find(status => stageStatus.includes(status));
                                const { icon } = stageStatus.includes("Completed") ? statusConfig["Completed"] : statusConfig[key];
                                return <RecruitmentCard key={recruitment._id} recruitment={recruitment} icon={icon} />
                            })
                        }
                    </div>
                </section>

            }
            <section className="flex flex-col gap-8 mt-10">
                <div className='flex justify-between items-center'>
                    <h2 className="text-xl font-semibold">Ongoing Recruitments for {orgDetails.abbr || orgDetails.name}</h2>
                    <Link className="link-btn group" href={`/recruitments?org=${orgDetails.slug}&status=ongoing`}>
                        See All <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
                    </Link>
                </div>
                {
                    orgDetails.ongoingRecruitments.length > 0 ?
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                            {
                                orgDetails.ongoingRecruitments.slice(0, 3).map(recruitment => {
                                    const stageStatus = recruitment.stageStatus;
                                    const key = Object.keys(statusConfig).find(status => stageStatus.includes(status));
                                    const { icon } = stageStatus.includes("Completed") ? statusConfig["Completed"] : statusConfig[key];
                                    return <RecruitmentCard key={recruitment._id} recruitment={recruitment} icon={icon} />
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