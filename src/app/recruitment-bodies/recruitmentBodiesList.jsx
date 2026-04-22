'use client';

import { RecruitmentBodyCard } from "@/components/cards/recruitmentBodyCard";
import PaginationComponent from "@/components/pagination";
import { SearchListSkeleton } from "@/components/skeletons";
import { useFilter } from "@/lib/context/filterContext";

export default function RecruitmentBodiesList({ itemCount, currentPage = 1, recruitmentBodies = [] }) {

    const { isPending } = useFilter();

    return (
        <div className="flex flex-col gap-10">
            {
                isPending ? <SearchListSkeleton type={'org'} /> :
                    <div className="flex flex-col gap-5 mt-5">
                        <h1 className="text-2xl">Results ({itemCount})</h1>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {
                                recruitmentBodies?.map(recruitmentBody => (
                                    <RecruitmentBodyCard key={recruitmentBody._id} recruitmentBody={recruitmentBody} />
                                ))
                            }
                        </div>
                    </div>
            }
            <PaginationComponent currentPage={currentPage} itemCount={itemCount} />
        </div>
    )
}