'use client';

import RecruitmentCard from "@/components/cards/recruitmentCard";
import { SearchListSkeleton } from "@/components/skeletons";

import statusConfig from "@/lib/statusConfig";
import { useFilter } from "@/lib/context/filterContext";
import PaginationComponent from "@/components/pagination";


export default function RecruitmentsList({ itemCount = 0, currentPage = 1, recruitments = [] }) {

    const { isPending, isPaginating } = useFilter();

    return (
        <div className="flex flex-col gap-10">
            {
                (isPending || isPaginating) ? <SearchListSkeleton type={'recruitment'} /> :
                    <div className="flex flex-col gap-5 mt-5">
                        <h1 className="text-2xl">Results ({itemCount})</h1>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mx-2 sm:mx-0">
                            {recruitments.map(recruitment => {
                                const stageStatus = recruitment.stageStatus;
                                const key = Object.keys(statusConfig).find(status => stageStatus.includes(status));
                                const { icon } = stageStatus.includes("Completed") ? statusConfig["Completed"] : statusConfig[key];
                                return (
                                    <RecruitmentCard key={recruitment._id} recruitment={recruitment} icon={icon} />
                                )
                            })}
                        </div>
                    </div>
            }
            {itemCount > 0 && <PaginationComponent currentPage={currentPage} itemCount={itemCount} />}
        </div>
    )
}