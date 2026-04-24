'use client';

import { OrgCard } from "@/components/cards/orgCard";
import PaginationComponent from "@/components/pagination";
import { SearchListSkeleton } from "@/components/skeletons";
import { useFilter } from "@/lib/context/filterContext";

export default function OrgsList({ itemCount, currentPage = 1, orgs = [] }) {

    const { isPending, isPaginating } = useFilter();

    return (
        <div className="flex flex-col gap-10">
            {
                (isPending || isPaginating) ? <SearchListSkeleton type={'org'} /> :
                    <div className="flex flex-col gap-5 mt-5">
                        <h2 className="text-2xl font-bold">Results ({itemCount})</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {
                                orgs?.map(org => (
                                    <OrgCard key={org._id} org={org} />
                                ))
                            }
                        </div>
                    </div>
            }
            {itemCount > 0 && <PaginationComponent currentPage={currentPage} itemCount={itemCount} />}
        </div>
    )
}