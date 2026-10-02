import { Suspense } from "react";

import Content from "./content";

import { ContentSkeleton } from "@/components/skeletons";

import { getJobContent, getJobMetadata } from "@/lib/serverUtils";
import { notFound } from "next/navigation";

export const generateMetadata = async ({ params }) => {
    const { lang, job, jobNavSlug } = await params;
    const jobMetadata = await getJobMetadata(lang, job, jobNavSlug);

    if (!jobMetadata)
        return null;

    const { title, description } = jobMetadata;

    return {
        title,
        description,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/jobs/${job}/${jobNavSlug}`
        },
        robots: { index: true, follow: true }
    }
}

export default function JobDetailPage({ params }) {
    return (
        <Suspense fallback={<ContentSkeleton />}>
            <MainContent params={params} />
        </Suspense>
    )
}

async function MainContent({ params }) {
    const { lang, job, jobNavSlug } = await params;
    const validNavSlugs = [
        'eligibility-criteria',
        'selection-process'
    ]
    if (!validNavSlugs.includes(jobNavSlug))
        notFound();

    const content = await getJobContent(lang, job, jobNavSlug);
    if (content)
        return <Content content={content} />
    else notFound();
}