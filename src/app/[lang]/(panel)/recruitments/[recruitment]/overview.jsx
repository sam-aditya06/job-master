'use client';

import Sidebar from "@/components/sidebars/sidebar";
import { ContentSkeleton } from "@/components/skeletons";
import { useContentLoader } from "@/lib/context/paginateContext";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function RecruitmentOverview({ content }) {
    const sp = useSearchParams();
    const stage = sp.get('stage');
    const year = sp.get('year');

    const { isLoading, setIsLoading } = useContentLoader();

    useEffect(() => {
        if (isLoading)
            setIsLoading(false);
    }, [stage, year])

    return (
        <>
        <div className="lg:hidden">
            <Sidebar screen={'mobile'} />
        </div>
            {
                isLoading ? <ContentSkeleton /> :
                    <div className="cms-content mt-14 lg:mt-0 sm:pr-3" dangerouslySetInnerHTML={{ __html: content }} />
            }
        </>
    )
}