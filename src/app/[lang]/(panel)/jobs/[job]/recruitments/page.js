import { Suspense } from "react";
import { notFound } from "next/navigation";

import Recruitments from "./recruitments";

import { ContentSkeleton } from "@/components/skeletons";

import { getJobMetadata, getJobRecruitmentDetails } from "@/lib/serverUtils";
import { formatLocationJsonLd } from "@/lib/utils";

export const generateMetadata = async ({ params }) => {
    const { lang, job } = await params;
    const jobMetadata = await getJobMetadata(lang, job, "recruitments");

    if(!jobMetadata)
        return null;
    
    const {title, description} = jobMetadata;

    return {
        title,
        description,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/jobs/${job}/recruitments`
        },
        robots: { index: true, follow: true }
    }
}

export default function JobRecruitmentDetailsPage({ params }) {
    return (
        <Suspense fallback={<ContentSkeleton />}>
            <MainContent params={params} />
        </Suspense>
    )
}

async function MainContent({ params }) {
    const { job, lang } = await params;
    const details = await getJobRecruitmentDetails(job, lang);
    if (!details)
        notFound();

    return (
        <Recruitments details={details} />
    )
}