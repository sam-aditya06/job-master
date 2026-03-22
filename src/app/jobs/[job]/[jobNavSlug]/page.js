import { Suspense } from "react";

import { getJobDetails } from "@/lib/serverUtils";
import Content from "./content";
import { ContentSkeleton } from "@/components/skeletons";

export default function JobDetailPage({ params }) {
    return (
        <Suspense fallback={<ContentSkeleton />}>
            <MainContent params={params} />
        </Suspense>
    )
}

async function MainContent({ params }) {
    const { job, jobNavSlug } = await params;
    const content = await getJobDetails(job, jobNavSlug);

    await new Promise(resolve => setTimeout(resolve, 2000));

    return <Content content={content} />
}