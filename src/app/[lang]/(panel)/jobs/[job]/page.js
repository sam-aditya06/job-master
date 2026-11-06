import { Suspense } from "react";

import Job from "./job";
import { getJobContent, getJobMetadata } from "@/lib/serverUtils";
import { ContentSkeleton } from "@/components/skeletons";
import { notFound } from "next/navigation";

export const generateMetadata = async ({ params }) => {
    const { lang, job } = await params;
    const jobDetails = await getJobMetadata(lang, job);

    if (!jobDetails)
        return {
            title: "Job not found",
            robots: { index: false, follow: false }
        };

    const { title, description } = jobDetails;

    return {
        title,
        description,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/jobs/${job}`
        },
        robots: { index: true, follow: true }
    }
}

export default function JobPage({ params }) {

    return (
        <Suspense fallback={<ContentSkeleton />}>
            <MainContent params={params} />
        </Suspense>
    )
}

async function MainContent({ params }) {
    const { job, lang } = await params;
    const jobDetails = await getJobContent(lang, job);

    if (!jobDetails)
        notFound();

    const { content, recruitments } = jobDetails;

    return <Job content={content} recruitments={recruitments} />
}