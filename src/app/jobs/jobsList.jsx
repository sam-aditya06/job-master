'use client';

import JobCard from "@/components/cards/jobCard";
import PaginationComponent from "@/components/pagination";
import { SearchListSkeleton } from "@/components/skeletons";
import { useFilter } from "@/lib/context/filterContext";

export default function JobsList({ itemCount, currentPage = 1, jobs = [] }) {

    const { isPending, isPaginating } = useFilter();

    return (
        <div className="flex flex-col gap-10">
            {
                (isPending || isPaginating) ? <SearchListSkeleton type={'job'} /> :
                <div className="flex flex-col gap-5 mt-5">
                <h2 className="text-2xl font-bold">Results ({itemCount})</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {
                        jobs?.map(job => (
                            <JobCard key={job._id} job={job} />
                        ))
                    }
                </div>
            </div>
            }
            {itemCount > 0 && <PaginationComponent currentPage={currentPage} itemCount={itemCount} />}
        </div>
    )
}