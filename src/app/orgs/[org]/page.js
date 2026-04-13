import { Suspense } from "react";
import { notFound } from "next/navigation";

import Org from "./org";
import { getOrgDetails } from "@/lib/serverUtils";
import { OrgsPageSkeleton } from "@/components/skeletons";
import { deslugify } from "@/lib/utils";

export const generateMetadata = async ({ params }) => {
    const { org } = await params
    const orgDetails = await getOrgDetails(org)

    if (!orgDetails) return {}

    return {
        title: orgDetails.abbr
            ? `${orgDetails.name} (${orgDetails.abbr}) | ${deslugify(orgDetails.sector)}`
            : `${orgDetails.name} | ${deslugify(orgDetails.sector)}`,
        description: orgDetails.shortDescription,
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_DOMAIN}/orgs/${org}`
        },
        robots: { index: true, follow: true }
    }
}

export default function OrgPage({ params }) {
    return (
        <Suspense fallback={<OrgsPageSkeleton type={'org'} />}>
            <MainContent params={params} />
        </Suspense>
    )
}

async function MainContent({ params }) {
    const { org } = await params
    const orgDetails = await getOrgDetails(org)

    if (!orgDetails) notFound()

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": orgDetails.name,
        "description": orgDetails.description,
        "url": orgDetails.homeUrl,
        "sameAs": orgDetails.homeUrl,
        ...(orgDetails.logoSrc && {
            "logo": orgDetails.logoSrc
        }),
        ...(orgDetails.abbr && {
            "alternateName": orgDetails.abbr
        })
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Org orgDetails={orgDetails} />
        </>
    )
}