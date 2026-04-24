'use client';

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { ContentSkeleton } from "@/components/skeletons";

import { useContentLoader } from "@/lib/context/paginateContext"

export default function Content({ content }) {
    const { isLoading, setIsLoading } = useContentLoader();
    const { jobNavSlug } = useParams();

    useEffect(() => {
        if (isLoading)
            setIsLoading(false);
    }, [jobNavSlug])

    return (
        <>
            {
                isLoading ? <ContentSkeleton /> :
                    <div className="cms-content pt-5 sm:pr-3 xl:pt-0" dangerouslySetInnerHTML={{ __html: content }} />
            }
        </>
    )
}