'use client';

import { RecruitmentBodyCard } from "@/components/cards/recruitmentBodyCard";

export default function RecruitmentBodiesList({ recruitmentBodies = [] }) {

    return (
        <div className="flex flex-col gap-5 mt-5">
            <h1 className="text-2xl">Results ({recruitmentBodies.length})</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {
                    recruitmentBodies?.map(recruitmentBody => (
                        <RecruitmentBodyCard key={recruitmentBody._id} recruitmentBody={recruitmentBody} />
                    ))
                }
            </div>
        </div>
    )
}