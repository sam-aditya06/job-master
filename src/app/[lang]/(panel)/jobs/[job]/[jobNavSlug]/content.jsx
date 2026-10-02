'use client';

import { useEffect } from "react";
import { useParams } from "next/navigation";

import { ContentSkeleton } from "@/components/skeletons";

import { useContentLoader } from "@/lib/context/paginateContext"
import Sidebar from "@/components/sidebars/sidebar";

export default function Content({ content }) {
    const { isLoading, setIsLoading } = useContentLoader();
    const { jobNavSlug } = useParams();

    useEffect(() => {
        if (isLoading)
            setIsLoading(false);
    }, [jobNavSlug])

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