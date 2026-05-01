'use client';

import Link from "next/link";

import { ArrowRight } from "lucide-react";

import RecruitmentCard from "@/components/cards/recruitmentCard";

import { capitalize } from "@/lib/utils";
import statusConfig from "@/lib/statusConfig";

export default function RecruitmentBody({ recruitmentBodyDetails }) {

    return (
        <div className="sm:pr-3">
            <section className="flex items-center gap-2">
                <div className="shrink-0 flex justify-center items-center border rounded-full h-12 sm:h-24 w-12 sm:w-24 p-2">
                    <div className="rounded-full flex justify-center items-center bg-white w-full h-full overflow-hidden">
                        <img src={`${process.env.NEXT_PUBLIC_CDN_URL}/${recruitmentBodyDetails.logoSrc}`} />
                    </div>
                </div>
                <div className="grow flex flex-col gap-1 h-fit">
                    <h1 className="text-xl sm:text-2xl">{recruitmentBodyDetails.name} ({recruitmentBodyDetails.abbr})</h1>
                    <p className="text-muted-foreground">{capitalize(recruitmentBodyDetails.sector)}</p>
                </div>
            </section>
            <section className="flex flex-col gap-2 mt-10">
                <h2 className="text-xl font-semibold">About this organisation:</h2>
                <p className="px-2 text-sm sm:text-base text-justify">{recruitmentBodyDetails.description}</p>
            </section>
            {
                recruitmentBodyDetails.topRecruitments &&
                <section className="flex flex-col gap-8 mt-10">
                    <div className='flex justify-between items-center'>
                        <h2 className="text-xl font-semibold">Top Recruitments</h2>
                        <Link className="link-btn group" href={`/recruitments?by=${recruitmentBodyDetails.slug}`}>
                            See All <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                        {
                            recruitmentBodyDetails.topRecruitments.map(recruitment => {
                                const key = Object.keys(statusConfig).filter(status => recruitment.stageStatus.includes(status));
                                const { color, icon } = statusConfig[key];
                                return <RecruitmentCard key={recruitment._id} recruitment={recruitment} color={color} icon={icon} page={'recruitment-body'} />
                            })
                        }
                    </div>
                </section>

            }
            <section className="flex flex-col gap-8 mt-10">
                <div className='flex justify-between items-center'>
                    <h2 className="text-xl font-semibold">Ongoing Recruitments</h2>
                    <Link className="link-btn group" href={`/recruitments?by=${recruitmentBodyDetails.slug}&status=ongoing`}>
                        See All <ArrowRight className="w-4 h-4 transition-all duration-150 group-hover:translate-x-1" />
                    </Link>
                </div>
                {
                    recruitmentBodyDetails.ongoingRecruitments ?
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                            {
                                recruitmentBodyDetails.ongoingRecruitments.map(recruitment => {
                                    const key = Object.keys(statusConfig).filter(status => recruitment.stageStatus.includes(status));
                                    const { color, icon } = statusConfig[key];
                                    return <RecruitmentCard key={recruitment._id} recruitment={recruitment} color={color} icon={icon} page={'recruitment-body'} />
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