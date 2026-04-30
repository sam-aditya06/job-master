import { Suspense } from "react";

import Overview from "./overview";
import { getJobContent, getJobDetails } from "@/lib/serverUtils";
import { ContentSkeleton } from "@/components/skeletons";
import { notFound } from "next/navigation";

export const generateMetadata = async ({ params }) => {
    const { job } = await params;
    const jobDetails = await getJobDetails(job);

    const edu = jobDetails.education;
    const loc = jobDetails.location;

    return {
        title: `${jobDetails.name} | ${jobDetails.org}`,
        description: `Complete details about the ${jobDetails.name} role.${edu ? ` Qualification: ${edu}.` : ""}${loc ? ` Location: ${loc}.` : ""} Check eligibility, responsibilities, perks, and latest recruitment.`,
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
    const { job } = await params;
    const [content, jobDetails] = await Promise.all([
        getJobContent(job),
        getJobDetails(job)
    ]);

    if(!content || !jobDetails)
        notFound();

    const location = () => {
        if (jobDetails.location.scope === 'all_india') return { "@type": "Country", "name": "India" }
        if (jobDetails.location.state) return { "@type": "AdministrativeArea", "name": capitalize(jobDetails.location.state) }
        return null
    }

    const industryMap = {
        "central-govt": "Government",
        "state-govt": "Government",
        "psu": "Public Sector",
        "banking": "Banking",
        "defence": "Defence",
        "railways": "Railways",
        "judiciary": "Judiciary",
        "police": "Police"
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Occupation",
        "name": jobDetails.name,
        "description": jobDetails.description,
        "hiringOrganization": {
            "@type": "Organization",
            "name": jobDetails.org
        },
        "educationRequirements": {
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": jobDetails.education
        },
        "occupationLocation": location,
        ...(jobDetails.payScale?.min && jobDetails.payScale?.max && {
            "baseSalary": {
                "@type": "MonetaryAmount",
                "currency": "INR",
                "value": {
                    "@type": "QuantitativeValue",
                    "minValue": jobDetails.payScale.min,
                    "maxValue": jobDetails.payScale.max,
                    "unitText": "MONTH"
                }
            }
        }),
        "industry": industryMap[jobDetails.sector] ?? deslugify(jobDetails.sector)
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Overview content={content} />
        </>
    )
}