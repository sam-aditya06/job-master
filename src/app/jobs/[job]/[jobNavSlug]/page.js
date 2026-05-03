import { Suspense } from "react";

import { getJobContent, getJobDetails, getJobRecruitmentDetails } from "@/lib/serverUtils";
import Content from "./content";
import { ContentSkeleton } from "@/components/skeletons";
import { notFound } from "next/navigation";
import RecruitmentDetails from "./recruitmentDetails";

export const generateMetadata = async ({ params }) => {
    const { job, jobNavSlug } = await params;
    const jobDetails = await getJobDetails(job);

    const edu = jobDetails.education;
    const loc = jobDetails.location;

    const base = `${process.env.NEXT_PUBLIC_DOMAIN}/jobs/${job}`

    const indexedSlugs = ["eligibility-criteria", "responsibilities"]
    const isIndexed = indexedSlugs.includes(jobNavSlug)

    const metaMap = {
        "eligibility-criteria": {
            title: `Eligibility Criteria — ${jobDetails.name} | ${jobDetails.org}`,
            description: `Eligibility criteria for the ${jobDetails.name} role.${edu ? ` Minimum qualification: ${edu}.` : ""}${loc ? ` Location: ${loc}.` : ""} Check age limit, experience, and category-wise relaxations.`
        },
        "responsibilities": {
            title: `Responsibilities — ${jobDetails.name} | ${jobDetails.org}`,
            description: `Job profile and responsibilities of the ${jobDetails.name} role. Key duties, day-to-day work, and what to expect in this position.`
        },
        "perks": {
            title: `Perks & Benefits — ${jobDetails.name} | ${jobDetails.org}`,
            description: `Perks and benefits of the ${jobDetails.name} role. Check salary structure, allowances, job security, and other benefits.`
        },
        "physical-standards": {
            title: `Physical Standards — ${jobDetails.name} | ${jobDetails.org}`,
            description: `Physical standards required for the ${jobDetails.name} role. Check height, weight, chest measurements, and other physical requirements.`
        },
        "medical-standards": {
            title: `Medical Standards — ${jobDetails.name} | ${jobDetails.org}`,
            description: `Medical standards required for the ${jobDetails.name} role. Check vision, hearing, and other health requirements for eligibility.`
        },
        "recruitment-details": {
            title: `Recruitment Details — ${jobDetails.name} | ${jobDetails.org}`,
            description: `Latest recruitment details for the ${jobDetails.name} role. Check the current recruitment status, stages, and official notification.`
        }
    }

    const meta = metaMap[jobNavSlug]
    if (!meta) return {}

    return {
        ...meta,
        alternates: {
            canonical: isIndexed ? `${base}/${jobNavSlug}` : base
        },
        robots: isIndexed
            ? { index: true, follow: true }
            : { index: false, follow: true }
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
    const { job, jobNavSlug } = await params;
    if (jobNavSlug === 'recruitment-details') {
        const details = await getJobRecruitmentDetails(job);
        if (details)
            return <RecruitmentDetails job={details} />
        else
            notFound();

    }
    else {
        const content = await getJobContent(job, jobNavSlug);
        if (content)
            return <Content content={content} />
        else
            notFound();

    }
}