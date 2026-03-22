import Link from "next/link";

import { Button } from "@/components/ui/button";
import { capitalize } from "@/lib/utils";
import RecruitmentCard from "@/components/cards/recruitmentCard";
import statusConfig from "@/lib/statusConfig";

export default function RecruitmentBody({ recruitmentBodyDetails }) {

    return (
        <>
            <section className="flex items-center gap-2">
                <div className="shrink-0 h-24 sm:h-48 w-24 sm:w-48 sm:p-4">
                    <img src={`${process.env.NEXT_PUBLIC_CDN_URL}/${recruitmentBodyDetails.logoSrc}`} />
                </div>
                <div className="grow flex flex-col gap-2 h-fit sm:h-40">
                    <h1 className="text-xl sm:text-2xl">{recruitmentBodyDetails.name} ({recruitmentBodyDetails.abbr})</h1>
                    <p className="pl-2 text-sm sm:text-base">Sector: {capitalize(recruitmentBodyDetails.sector)}</p>
                    <p className="pl-2 text-sm sm:text-base">Offical Website: <Link target="_blank" className="text-blue-500 dark:text-blue-300 underline" href={recruitmentBodyDetails.homeUrl}>{recruitmentBodyDetails.homeUrl}</Link></p>
                </div>
            </section>
            <section className="flex flex-col gap-2 mt-10">
                <h2 className="text-xl font-semibold">About this organisation:</h2>
                <p className="px-2 text-sm sm:text-base text-justify">{recruitmentBodyDetails.description}</p>
            </section>
            <section className="flex flex-col gap-5 mt-10">
                <h2 className="text-xl font-semibold">Top Recruitments:</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                    {
                        recruitmentBodyDetails.topRecruitments.map(recruitment => {
                            Object.keys(statusConfig).forEach(status => console.log({ status, stageStatus: recruitment.stageStatus }));
                            const key = Object.keys(statusConfig).filter(status => recruitment.stageStatus.includes(status));
                            const { color, icon } = statusConfig[key];
                            return <RecruitmentCard key={recruitment._id} recruitment={recruitment} color={color} icon={icon} page={'recruitment-body'} />
                        })
                    }
                </div>
                <Button className='mx-auto w-fit'>See All</Button>
            </section>
        </>
    )
}