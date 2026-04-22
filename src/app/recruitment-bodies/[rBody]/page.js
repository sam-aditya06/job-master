import { Suspense } from "react";
import { notFound } from "next/navigation";

import RecruitmentBody from "./recruitmentBody";
import { OrgsPageSkeleton } from "@/components/skeletons";
import { getRecruitmentBodyDetails } from "@/lib/serverUtils";
import { deslugify } from "@/lib/utils";

export const generateMetadata = async ({ params }) => {
    const { rBody } = await params
    const rBodyDetails = await getRecruitmentBodyDetails(rBody)

    if (!rBodyDetails) return {}

    return {
        title: rBodyDetails.abbr
            ? `${rBodyDetails.name} (${rBodyDetails.abbr}) | ${deslugify(rBodyDetails.sector)}`
            : `${rBodyDetails.name} | ${deslugify(rBodyDetails.sector)}`,
        description: rBodyDetails.shortDescription,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/recruitment-bodies/${rBody}`
        },
        robots: { index: true, follow: true }
    }
}

export default function RecruitmentBodyPage({ params }) {
    return (
        <Suspense fallback={<OrgsPageSkeleton />}>
            <MainContent params={params} />
        </Suspense>
    )
}

async function MainContent({ params }) {
    const { rBody } = await params
    const recruitmentBodyDetails = await getRecruitmentBodyDetails(rBody);

    if (!recruitmentBodyDetails) notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "GovernmentOrganization",
        "name": recruitmentBodyDetails.name,
        "description": recruitmentBodyDetails.description,
        "url": recruitmentBodyDetails.homeUrl,
        "sameAs": recruitmentBodyDetails.homeUrl,
        ...(recruitmentBodyDetails.logoSrc && {
            "logo": recruitmentBodyDetails.logoSrc
        }),
        ...(recruitmentBodyDetails.abbr && {
            "alternateName": recruitmentBodyDetails.abbr
        })
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <RecruitmentBody recruitmentBodyDetails={recruitmentBodyDetails} />
        </>
    )
}