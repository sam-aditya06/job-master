'use client';

import { JobCardV1, JobCardV2 } from "@/components/cards/jobCard";
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
                        <div className="md:hidden grid grid-cols-1 gap-4">
                            {
                                jobs?.map(job => (
                                    <JobCardV2 key={job.slug} job={job} />
                                ))
                            }
                        </div>
                        <div className="hidden md:grid grid-cols-1 gap-4">
                            {
                                jobs?.map(job => (
                                    <JobCardV1 key={job.slug} job={job} />
                                ))
                            }
                        </div>
                    </div>
            }
            {itemCount > 0 && <PaginationComponent currentPage={currentPage} itemCount={itemCount} />}
        </div>
    )
}