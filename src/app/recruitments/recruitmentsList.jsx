'use client';

import statusConfig from "@/lib/statusConfig";
import RecruitmentCard from "@/components/cards/recruitmentCard";

export default function RecruitmentsList({ recruitments = [] }) {

    return (
        <div className="flex flex-col gap-5 mt-5">
            <h1 className="text-2xl">Results ({recruitments.length})</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-2 sm:mx-0">
                {
                    recruitments?.map(recruitment => {
                        const key = Object.keys(statusConfig).filter(status => recruitment.stageStatus.includes(status));
                        const { color, icon } = statusConfig[key];
                        return (
                           <RecruitmentCard key={recruitment._id} recruitment={recruitment} color={color} icon={icon} />
                        )
                    })
                }
            </div>
        </div >
    )
}