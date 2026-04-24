'use client';

import { ContentSkeleton } from "@/components/skeletons";
import { useContentLoader } from "@/lib/context/paginateContext";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Recruitment({ content }) {
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
            {
                isLoading ? <ContentSkeleton /> :
                    <div className="cms-content pt-5 sm:pr-3 xl:pt-0" dangerouslySetInnerHTML={{ __html: content }} />
            }
        </>
    )
}