'use client';

import { useEffect } from "react";

import { useContentLoader } from "@/lib/context/paginateContext"
import { ContentSkeleton } from "@/components/skeletons";
import { useParams } from "next/navigation";
import { PanelLeftOpen } from "lucide-react";
import Sidebar from "@/components/sidebars/sidebar";

export default function Overview({ content }) {
    const { isLoading, setIsLoading } = useContentLoader();
    const { jobNavSlug } = useParams();

    useEffect(() => {
        if (!jobNavSlug)
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