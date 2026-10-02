'use client';

import { RecruitmentCardV1, RecruitmentCardV2 } from "@/components/cards/recruitmentCard";
import { SearchListSkeleton } from "@/components/skeletons";

import { useFilter } from "@/lib/context/filterContext";
import PaginationComponent from "@/components/pagination";


export default function RecruitmentsList({ itemCount = 0, currentPage = 1, recruitments = [] }) {

    const { isPending, isPaginating } = useFilter();

    return (
        <div className="flex flex-col gap-10">
            {
                (isPending || isPaginating) ? <SearchListSkeleton type={'recruitment'} /> :
                    <div className="flex flex-col gap-5 mt-5">
                        <h1 className="text-2xl font-bold">Results ({itemCount})</h1>
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {
                                recruitments.map(recruitment => (
                                    <RecruitmentCardV2 key={recruitment._id} recruitment={recruitment} />
                                ))
                            }
                        </div>
                        <div className="hidden md:grid grid-cols-1 gap-4">
                            {
                                recruitments.map(recruitment => (
                                    <RecruitmentCardV1 key={recruitment._id} recruitment={recruitment} />
                                ))
                            }
                        </div>
                    </div>
            }
            {itemCount > 0 && <PaginationComponent currentPage={currentPage} itemCount={itemCount} />}
        </div>
    )
}