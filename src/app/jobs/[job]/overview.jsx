'use client';

import { useEffect } from "react";

import { useContentLoader } from "@/lib/context/paginateContext"
import { ContentSkeleton } from "@/components/skeletons";
import { useParams } from "next/navigation";

export default function Overview({ content }) {
    const { isLoading, setIsLoading } = useContentLoader();
    const { jobNavSlug } = useParams();

    useEffect(() => {
        if (!jobNavSlug)
            setIsLoading(false);
    }, [jobNavSlug])

    return (
        <>
            {
                isLoading ? <ContentSkeleton /> :
                    content ?
                        <div className="cms-content pt-5 sm:pr-3 xl:pt-0" dangerouslySetInnerHTML={{ __html: content }} /> :
                        <div className="flex justify-center items-center h-full text-3xl text-muted-foreground">
                            Information is not available at the moment
                        </div>
            }
        </>
    )
}