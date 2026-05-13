import { Suspense } from "react";
import { notFound } from "next/navigation";

import RecruitmentDetails from "./recruitmentDetails";

import { ContentSkeleton } from "@/components/skeletons";

import { getJobDetails, getJobRecruitmentDetails } from "@/lib/serverUtils";
import { formatLocationJsonLd } from "@/lib/utils";

export const generateMetadata = async ({ params }) => {
    const { job } = await params;
    const jobDetails = await getJobDetails(job);

    return {
        title: `${jobDetails.name} — Recruitment Details`,
        description: `Latest recruitment details for the ${jobDetails.name} role. Check the current recruitment status, stages, and official notification.`,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/jobs/${job}/recruitment-details`
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
    const { job } = await params;
    const details = await getJobRecruitmentDetails(job);
    if (!details)
        notFound();

    const locationJsonLd = formatLocationJsonLd(details.location);

    const employmentTypeMap = {
        "permanent": "FULL_TIME",
        "contractual": "CONTRACTOR",
        "deputation": "TEMPORARY",
        "apprenticeship": "PART_TIME",
        "internship": "INTERN"
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": details.name,
        "description": details.description,
        "hiringOrganization": {
            "@type": "Organization",
            "name": details.recruiterName
        },
        "employmentType": employmentTypeMap[details.jobType],
        ...(locationJsonLd && {
            "jobLocation": {
                "@type": "Place",
                "address": locationJsonLd
            }
        }),
        ...(details.recStatus === "ongoing" && {
            "validThrough": details.registrationDeadline
        }),
        "directApply": false,
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <RecruitmentDetails job={details} />
        </>
    )
}